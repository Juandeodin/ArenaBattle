import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
  Gladiator,
  GameConfig,
  CreateGladiatorDto,
  RoomStatus
} from '../types';
import { getRepository, toGameState, toMatchPublicInfo, toPlayerPublicInfo } from '../data';
import { TournamentEngine, BettingSystem, CombatSimulator } from '../game';
import { createAIProvider, IAIProvider } from '../services';

export class GameManager {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private aiProvider: IAIProvider;
  private config: GameConfig;
  private bettingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.aiProvider = createAIProvider();
    this.config = {
      initialCoins: parseInt(process.env.INITIAL_COINS || '100'),
      minBet: parseInt(process.env.MIN_BET || '10'),
      bettingTimeSeconds: parseInt(process.env.BETTING_TIME_SECONDS || '30'),
      maxPlayers: parseInt(process.env.MAX_PLAYERS || '16'),
      ownerBonus: 20
    };
  }

  setupSocketHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    socket.on('room:create', async (playerName, callback) => {
      await this.handleCreateRoom(socket, playerName, callback);
    });

    socket.on('room:join', async (roomCode, playerName, sessionToken, callback) => {
      await this.handleJoinRoom(socket, roomCode, playerName, sessionToken, callback);
    });

    socket.on('room:leave', async () => {
      await this.handleLeaveRoom(socket);
    });

    socket.on('gladiator:create', async (gladiatorData) => {
      await this.handleCreateGladiator(socket, gladiatorData);
    });

    socket.on('game:start', async () => {
      await this.handleStartGame(socket);
    });

    socket.on('bet:place', async (gladiatorId, amount) => {
      await this.handlePlaceBet(socket, gladiatorId, amount);
    });

    socket.on('bet:skip', async () => {
      await this.handleSkipBet(socket);
    });

    socket.on('disconnect', async () => {
      await this.handleDisconnect(socket);
    });
  }

  private async handleCreateRoom(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    playerName: string,
    callback: (response: any) => void
  ) {
    const repo = getRepository();
    const sessionToken = uuidv4();
    
    const player: Player = {
      id: uuidv4(),
      sessionToken,
      name: playerName,
      coins: this.config.initialCoins,
      gladiator: null,
      isHost: true,
      isConnected: true,
      socketId: socket.id
    };

    const room = await repo.createRoom(player, this.config);
    socket.join(room.code);

    callback({
      success: true,
      roomCode: room.code,
      sessionToken
    });

    this.broadcastGameState(room.code);
  }

  private async handleJoinRoom(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    roomCode: string,
    playerName: string,
    sessionToken: string | null,
    callback: (response: any) => void
  ) {
    const repo = getRepository();
    const room = await repo.getRoom(roomCode.toUpperCase());

    if (!room) {
      callback({ success: false, error: 'Sala no encontrada' });
      return;
    }

    // Intentar reconexión
    if (sessionToken) {
      const existing = await repo.getPlayerBySessionToken(sessionToken);
      if (existing && existing.roomCode === roomCode.toUpperCase()) {
        existing.player.isConnected = true;
        existing.player.socketId = socket.id;
        await repo.updatePlayer(roomCode.toUpperCase(), existing.player);
        
        socket.join(room.code);
        callback({
          success: true,
          roomCode: room.code,
          sessionToken
        });

        this.io.to(room.code).emit('player:reconnected', toPlayerPublicInfo(existing.player));
        this.broadcastGameState(room.code);
        return;
      }
    }

    // Nuevo jugador
    if (room.status !== 'waiting') {
      callback({ success: false, error: 'El juego ya ha comenzado' });
      return;
    }

    if (room.players.size >= this.config.maxPlayers) {
      callback({ success: false, error: 'Sala llena' });
      return;
    }

    const newSessionToken = uuidv4();
    const player: Player = {
      id: uuidv4(),
      sessionToken: newSessionToken,
      name: playerName,
      coins: this.config.initialCoins,
      gladiator: null,
      isHost: false,
      isConnected: true,
      socketId: socket.id
    };

    await repo.addPlayerToRoom(room.code, player);
    socket.join(room.code);

    callback({
      success: true,
      roomCode: room.code,
      sessionToken: newSessionToken
    });

    this.io.to(room.code).emit('player:joined', toPlayerPublicInfo(player));
    this.broadcastGameState(room.code);
  }

  private async handleLeaveRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    const repo = getRepository();
    
    for (const roomCode of socket.rooms) {
      if (roomCode === socket.id) continue;
      
      const room = await repo.getRoom(roomCode);
      if (!room) continue;

      for (const player of room.players.values()) {
        if (player.socketId === socket.id) {
          // Si el juego no ha empezado, eliminar completamente
          if (room.status === 'waiting') {
            await repo.removePlayerFromRoom(roomCode, player.id);
            
            // Si era host, asignar nuevo host
            const newRoom = await repo.getRoom(roomCode);
            if (newRoom && newRoom.players.size > 0) {
              const newHost = newRoom.players.values().next().value;
              if (newHost) {
                newHost.isHost = true;
                await repo.updatePlayer(roomCode, newHost);
              }
            }
          } else {
            // Si el juego está en curso, marcar como desconectado
            player.isConnected = false;
            player.socketId = null;
            await repo.updatePlayer(roomCode, player);
          }

          this.io.to(roomCode).emit('player:left', player.id);
          this.broadcastGameState(roomCode);
          break;
        }
      }
    }
  }

  private async handleCreateGladiator(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    data: CreateGladiatorDto
  ) {
    const repo = getRepository();
    const { player, room } = await this.getPlayerAndRoom(socket);
    
    if (!player || !room) {
      socket.emit('game:error', 'No estás en una sala');
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('game:error', 'No puedes crear gladiador ahora');
      return;
    }

    const gladiator: Gladiator = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      abilities: data.abilities.slice(0, 3),
      ownerId: player.id,
      wins: 0,
      losses: 0
    };

    player.gladiator = gladiator;
    await repo.updatePlayer(room.code, player);

    // Verificar si todos tienen gladiador
    const allReady = Array.from(room.players.values()).every(p => p.gladiator !== null);
    if (allReady && room.players.size >= 2) {
      room.status = 'ready';
      await repo.updateRoom(room);
    }

    this.broadcastGameState(room.code);
  }

  private async handleStartGame(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    const repo = getRepository();
    const { player, room } = await this.getPlayerAndRoom(socket);

    if (!player || !room) {
      socket.emit('game:error', 'No estás en una sala');
      return;
    }

    if (!player.isHost) {
      socket.emit('game:error', 'Solo el host puede iniciar el juego');
      return;
    }

    if (room.status !== 'ready') {
      socket.emit('game:error', 'No todos los jugadores tienen gladiador');
      return;
    }

    // Crear bracket del torneo
    const gladiators = Array.from(room.players.values())
      .map(p => p.gladiator!)
      .filter(g => g !== null);

    room.tournament = TournamentEngine.createBracket(gladiators);
    await repo.updateRoom(room);

    // Iniciar primera ronda
    await this.startNextMatch(room.code);
  }

  private async handlePlaceBet(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    gladiatorId: string,
    amount: number
  ) {
    const repo = getRepository();
    const { player, room } = await this.getPlayerAndRoom(socket);

    if (!player || !room) {
      socket.emit('game:error', 'No estás en una sala');
      return;
    }

    if (room.status !== 'betting' || !room.currentMatch) {
      socket.emit('game:error', 'No es momento de apostar');
      return;
    }

    const bettingSystem = new BettingSystem(this.config);
    const result = bettingSystem.placeBet(player, gladiatorId, amount, room.currentMatch);

    if (!result.success) {
      socket.emit('game:error', result.error!);
      return;
    }

    await repo.updatePlayer(room.code, player);
    await repo.updateRoom(room);
    this.broadcastGameState(room.code);
  }

  private async handleSkipBet(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    // Por ahora no hace nada especial, el jugador simplemente no apuesta
    // El timer se encargará de avanzar
  }

  private async handleDisconnect(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    await this.handleLeaveRoom(socket);
  }

  private async startNextMatch(roomCode: string) {
    const repo = getRepository();
    const room = await repo.getRoom(roomCode);
    if (!room || !room.tournament) return;

    // Obtener siguiente combate (saltando byes)
    const nextMatch = TournamentEngine.getNextMatch(room.tournament);

    if (!nextMatch) {
      // Torneo terminado
      room.status = 'finished';
      await repo.updateRoom(room);
      
      const bettingSystem = new BettingSystem(this.config);
      const winners = bettingSystem.getWinners(room.players);
      
      this.io.to(roomCode).emit('tournament:end', 
        winners.map(toPlayerPublicInfo),
        room.tournament.champion!
      );
      this.broadcastGameState(roomCode);
      return;
    }

    room.currentMatch = nextMatch;
    room.status = 'betting';
    room.bettingEndTime = Date.now() + (this.config.bettingTimeSeconds * 1000);
    await repo.updateRoom(room);

    this.io.to(roomCode).emit('match:start', toMatchPublicInfo(nextMatch));
    this.broadcastGameState(roomCode);

    // Iniciar countdown
    this.startBettingCountdown(roomCode);
  }

  private startBettingCountdown(roomCode: string) {
    // Limpiar timer anterior si existe
    const existingTimer = this.bettingTimers.get(roomCode);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    let secondsLeft = this.config.bettingTimeSeconds;
    
    const timer = setInterval(async () => {
      secondsLeft--;
      this.io.to(roomCode).emit('game:countdown', secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(timer);
        this.bettingTimers.delete(roomCode);
        await this.executeCombat(roomCode);
      }
    }, 1000);

    this.bettingTimers.set(roomCode, timer);
  }

  private async executeCombat(roomCode: string) {
    const repo = getRepository();
    const room = await repo.getRoom(roomCode);
    if (!room || !room.currentMatch || !room.tournament) return;

    room.status = 'fighting';
    await repo.updateRoom(room);
    this.broadcastGameState(roomCode);

    // Simular combate con IA
    const combatSimulator = new CombatSimulator(this.aiProvider);
    const result = await combatSimulator.simulateCombat(room.currentMatch);

    // Emitir narración progresivamente (efecto typewriter)
    this.io.to(roomCode).emit('game:narration', result.narration);

    // Registrar resultado en el bracket
    TournamentEngine.setMatchResult(
      room.tournament,
      room.currentMatch.id,
      result.winner,
      result.narration
    );

    // Distribuir pagos
    const bettingSystem = new BettingSystem(this.config);
    const payouts = bettingSystem.distributePayout(
      room.currentMatch,
      result.winner.id,
      room.players
    );

    room.currentMatch.winner = result.winner;
    room.currentMatch.narration = result.narration;
    room.status = 'results';
    await repo.updateRoom(room);

    this.io.to(roomCode).emit('match:result', toMatchPublicInfo(room.currentMatch), payouts);
    this.broadcastGameState(roomCode);

    // Esperar unos segundos antes del siguiente combate
    setTimeout(async () => {
      await this.startNextMatch(roomCode);
    }, 5000);
  }

  private async getPlayerAndRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    const repo = getRepository();
    
    for (const roomCode of socket.rooms) {
      if (roomCode === socket.id) continue;
      
      const room = await repo.getRoom(roomCode);
      if (!room) continue;

      for (const player of room.players.values()) {
        if (player.socketId === socket.id) {
          return { player, room };
        }
      }
    }

    return { player: null, room: null };
  }

  private async broadcastGameState(roomCode: string) {
    const repo = getRepository();
    const room = await repo.getRoom(roomCode);
    if (!room) return;

    let bettingTimeLeft: number | null = null;
    if (room.status === 'betting' && room.bettingEndTime) {
      bettingTimeLeft = Math.max(0, Math.ceil((room.bettingEndTime - Date.now()) / 1000));
    }

    const gameState = toGameState(room, bettingTimeLeft);
    this.io.to(roomCode).emit('game:state', gameState);
  }
}
