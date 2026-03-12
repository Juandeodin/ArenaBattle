import { io, Socket } from 'socket.io-client';
import { 
  GameState, 
  PlayerPublicInfo, 
  MatchPublicInfo, 
  PayoutInfo,
  CreateGladiatorDto,
  RoomResponse,
  Gladiator
} from '../types';

// Eventos del servidor al cliente
interface ServerToClientEvents {
  'game:state': (state: GameState) => void;
  'game:error': (message: string) => void;
  'game:narration': (text: string) => void;
  'game:countdown': (seconds: number) => void;
  'player:joined': (player: PlayerPublicInfo) => void;
  'player:left': (playerId: string) => void;
  'player:reconnected': (player: PlayerPublicInfo) => void;
  'match:start': (match: MatchPublicInfo) => void;
  'match:result': (match: MatchPublicInfo, payouts: PayoutInfo[]) => void;
  'tournament:end': (winners: PlayerPublicInfo[], champion: Gladiator) => void;
}

// Eventos del cliente al servidor
interface ClientToServerEvents {
  'room:create': (playerName: string, callback: (response: RoomResponse) => void) => void;
  'room:join': (roomCode: string, playerName: string, sessionToken: string | null, callback: (response: RoomResponse) => void) => void;
  'room:leave': () => void;
  'gladiator:create': (gladiator: CreateGladiatorDto) => void;
  'game:start': () => void;
  'game:continue': () => void;
  'bet:place': (gladiatorId: string, amount: number) => void;
  'bet:skip': () => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): TypedSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.PROD 
      ? window.location.origin 
      : 'http://localhost:3001';

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor');
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }

  // Room operations
  createRoom(playerName: string): Promise<RoomResponse> {
    return new Promise((resolve) => {
      this.socket?.emit('room:create', playerName, resolve);
    });
  }

  joinRoom(roomCode: string, playerName: string, sessionToken: string | null = null): Promise<RoomResponse> {
    return new Promise((resolve) => {
      this.socket?.emit('room:join', roomCode, playerName, sessionToken, resolve);
    });
  }

  leaveRoom(): void {
    this.socket?.emit('room:leave');
  }

  // Gladiator operations
  createGladiator(data: CreateGladiatorDto): void {
    this.socket?.emit('gladiator:create', data);
  }

  // Game operations
  startGame(): void {
    this.socket?.emit('game:start');
  }

  continueGame(): void {
    this.socket?.emit('game:continue');
  }

  placeBet(gladiatorId: string, amount: number): void {
    this.socket?.emit('bet:place', gladiatorId, amount);
  }

  skipBet(): void {
    this.socket?.emit('bet:skip');
  }

  // Event listeners
  onGameState(callback: (state: GameState) => void): () => void {
    this.socket?.on('game:state', callback);
    return () => this.socket?.off('game:state', callback);
  }

  onGameError(callback: (message: string) => void): () => void {
    this.socket?.on('game:error', callback);
    return () => this.socket?.off('game:error', callback);
  }

  onNarration(callback: (text: string) => void): () => void {
    this.socket?.on('game:narration', callback);
    return () => this.socket?.off('game:narration', callback);
  }

  onCountdown(callback: (seconds: number) => void): () => void {
    this.socket?.on('game:countdown', callback);
    return () => this.socket?.off('game:countdown', callback);
  }

  onPlayerJoined(callback: (player: PlayerPublicInfo) => void): () => void {
    this.socket?.on('player:joined', callback);
    return () => this.socket?.off('player:joined', callback);
  }

  onPlayerLeft(callback: (playerId: string) => void): () => void {
    this.socket?.on('player:left', callback);
    return () => this.socket?.off('player:left', callback);
  }

  onPlayerReconnected(callback: (player: PlayerPublicInfo) => void): () => void {
    this.socket?.on('player:reconnected', callback);
    return () => this.socket?.off('player:reconnected', callback);
  }

  onMatchStart(callback: (match: MatchPublicInfo) => void): () => void {
    this.socket?.on('match:start', callback);
    return () => this.socket?.off('match:start', callback);
  }

  onMatchResult(callback: (match: MatchPublicInfo, payouts: PayoutInfo[]) => void): () => void {
    this.socket?.on('match:result', callback);
    return () => this.socket?.off('match:result', callback);
  }

  onTournamentEnd(callback: (winners: PlayerPublicInfo[], champion: Gladiator) => void): () => void {
    this.socket?.on('tournament:end', callback);
    return () => this.socket?.off('tournament:end', callback);
  }
}

export const socketService = new SocketService();
