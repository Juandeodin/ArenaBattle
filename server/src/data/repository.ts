import {
  Room,
  Player,
  Gladiator,
  Match,
  GameConfig,
  GameState,
  PlayerPublicInfo,
  MatchPublicInfo,
  TournamentPublicInfo
} from '../types';

// Interfaz abstracta para repositorio de datos
// Preparada para implementar con base de datos en el futuro
export interface IGameRepository {
  // Rooms
  createRoom(hostPlayer: Player, config: GameConfig): Promise<Room>;
  getRoom(roomCode: string): Promise<Room | null>;
  getRoomByPlayerId(playerId: string): Promise<Room | null>;
  updateRoom(room: Room): Promise<void>;
  deleteRoom(roomCode: string): Promise<void>;
  
  // Players
  addPlayerToRoom(roomCode: string, player: Player): Promise<void>;
  removePlayerFromRoom(roomCode: string, playerId: string): Promise<void>;
  getPlayerBySessionToken(sessionToken: string): Promise<{ player: Player; roomCode: string } | null>;
  updatePlayer(roomCode: string, player: Player): Promise<void>;
}

// Implementación en memoria
export class MemoryRepository implements IGameRepository {
  private rooms: Map<string, Room> = new Map();
  private sessionToRoom: Map<string, string> = new Map(); // sessionToken -> roomCode

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createRoom(hostPlayer: Player, config: GameConfig): Promise<Room> {
    let code: string;
    do {
      code = this.generateRoomCode();
    } while (this.rooms.has(code));

    const room: Room = {
      id: code,
      code,
      players: new Map([[hostPlayer.id, hostPlayer]]),
      status: 'waiting',
      tournament: null,
      currentMatch: null,
      bettingEndTime: null,
      config,
      createdAt: new Date()
    };

    this.rooms.set(code, room);
    this.sessionToRoom.set(hostPlayer.sessionToken, code);

    return room;
  }

  async getRoom(roomCode: string): Promise<Room | null> {
    return this.rooms.get(roomCode) || null;
  }

  async getRoomByPlayerId(playerId: string): Promise<Room | null> {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) {
        return room;
      }
    }
    return null;
  }

  async updateRoom(room: Room): Promise<void> {
    this.rooms.set(room.code, room);
  }

  async deleteRoom(roomCode: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (room) {
      for (const player of room.players.values()) {
        this.sessionToRoom.delete(player.sessionToken);
      }
      this.rooms.delete(roomCode);
    }
  }

  async addPlayerToRoom(roomCode: string, player: Player): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.players.set(player.id, player);
      this.sessionToRoom.set(player.sessionToken, roomCode);
    }
  }

  async removePlayerFromRoom(roomCode: string, playerId: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (room) {
      const player = room.players.get(playerId);
      if (player) {
        this.sessionToRoom.delete(player.sessionToken);
        room.players.delete(playerId);
      }
      
      // Si la sala queda vacía, eliminarla
      if (room.players.size === 0) {
        this.rooms.delete(roomCode);
      }
    }
  }

  async getPlayerBySessionToken(sessionToken: string): Promise<{ player: Player; roomCode: string } | null> {
    const roomCode = this.sessionToRoom.get(sessionToken);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    for (const player of room.players.values()) {
      if (player.sessionToken === sessionToken) {
        return { player, roomCode };
      }
    }
    return null;
  }

  async updatePlayer(roomCode: string, player: Player): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.players.set(player.id, player);
    }
  }
}

// Utilidades para convertir a formato público
export function toPlayerPublicInfo(player: Player): PlayerPublicInfo {
  return {
    id: player.id,
    name: player.name,
    coins: player.coins,
    gladiator: player.gladiator,
    isHost: player.isHost,
    isConnected: player.isConnected
  };
}

export function toMatchPublicInfo(match: Match): MatchPublicInfo {
  const totalPool = match.bets.reduce((sum, bet) => sum + bet.amount, 0);
  return {
    id: match.id,
    gladiator1: match.gladiator1,
    gladiator2: match.gladiator2,
    winner: match.winner,
    narration: match.narration,
    totalPool,
    round: match.round
  };
}

export function toTournamentPublicInfo(room: Room): TournamentPublicInfo | null {
  if (!room.tournament) return null;
  
  const { TournamentEngine } = require('../game/tournamentEngine');
  
  return {
    totalRounds: room.tournament.rounds.length,
    currentRound: room.tournament.currentRound + 1,
    currentMatchIndex: room.tournament.currentMatchIndex,
    matchesInCurrentRound: room.tournament.rounds[room.tournament.currentRound]?.length || 0,
    champion: room.tournament.champion,
    bracket: TournamentEngine.toBracketPublic(room.tournament)
  };
}

export function toGameState(room: Room, bettingTimeLeft: number | null = null): GameState {
  const players = Array.from(room.players.values()).map(toPlayerPublicInfo);
  
  let winners: PlayerPublicInfo[] | null = null;
  if (room.status === 'finished') {
    const { BettingSystem } = require('../game/bettingSystem');
    const bettingSystem = new BettingSystem(room.config);
    winners = bettingSystem.getWinners(room.players).map(toPlayerPublicInfo);
  }

  return {
    roomCode: room.code,
    status: room.status,
    players,
    currentMatch: room.currentMatch ? toMatchPublicInfo(room.currentMatch) : null,
    tournament: toTournamentPublicInfo(room),
    bettingTimeLeft,
    winners
  };
}

// Singleton del repositorio
let repository: IGameRepository | null = null;

export function getRepository(): IGameRepository {
  if (!repository) {
    repository = new MemoryRepository();
  }
  return repository;
}
