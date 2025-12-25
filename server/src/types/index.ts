// Tipos compartidos del juego Arena Battle

export interface Gladiator {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  ownerId: string;
  wins: number;
  losses: number;
}

export interface Player {
  id: string;
  sessionToken: string;
  name: string;
  coins: number;
  gladiator: Gladiator | null;
  isHost: boolean;
  isConnected: boolean;
  socketId: string | null;
}

export interface Bet {
  playerId: string;
  gladiatorId: string;
  amount: number;
}

export interface Match {
  id: string;
  gladiator1: Gladiator;
  gladiator2: Gladiator;
  winner: Gladiator | null;
  narration: string;
  bets: Bet[];
  round: number;
}

export interface TournamentBracket {
  rounds: Match[][];
  currentRound: number;
  currentMatchIndex: number;
  champion: Gladiator | null;
}

export interface Room {
  id: string;
  code: string;
  players: Map<string, Player>;
  status: RoomStatus;
  tournament: TournamentBracket | null;
  currentMatch: Match | null;
  bettingEndTime: number | null;
  config: GameConfig;
  createdAt: Date;
}

export interface GameConfig {
  initialCoins: number;
  minBet: number;
  bettingTimeSeconds: number;
  maxPlayers: number;
  ownerBonus: number; // Porcentaje de bonus si gana tu gladiador
}

export type RoomStatus = 
  | 'waiting'      // Esperando jugadores en lobby
  | 'ready'        // Todos tienen gladiador, listo para empezar
  | 'betting'      // Fase de apuestas (30s)
  | 'fighting'     // Combate en progreso (IA narrando)
  | 'results'      // Mostrando resultados del combate
  | 'finished';    // Torneo terminado

export interface GameState {
  roomCode: string;
  status: RoomStatus;
  players: PlayerPublicInfo[];
  currentMatch: MatchPublicInfo | null;
  tournament: TournamentPublicInfo | null;
  bettingTimeLeft: number | null;
  winners: PlayerPublicInfo[] | null;
}

// Información pública (sin tokens de sesión)
export interface PlayerPublicInfo {
  id: string;
  name: string;
  coins: number;
  gladiator: Gladiator | null;
  isHost: boolean;
  isConnected: boolean;
}

export interface MatchPublicInfo {
  id: string;
  gladiator1: Gladiator;
  gladiator2: Gladiator;
  winner: Gladiator | null;
  narration: string;
  totalPool: number;
  round: number;
}

export interface TournamentPublicInfo {
  totalRounds: number;
  currentRound: number;
  currentMatchIndex: number;
  matchesInCurrentRound: number;
  champion: Gladiator | null;
  bracket: BracketMatch[][];
}

export interface BracketMatch {
  gladiator1Name: string | null;
  gladiator2Name: string | null;
  winnerName: string | null;
  completed: boolean;
}

// Eventos de Socket.io
export interface ServerToClientEvents {
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

export interface ClientToServerEvents {
  'room:create': (playerName: string, callback: (response: RoomResponse) => void) => void;
  'room:join': (roomCode: string, playerName: string, sessionToken: string | null, callback: (response: RoomResponse) => void) => void;
  'room:leave': () => void;
  'gladiator:create': (gladiator: CreateGladiatorDto) => void;
  'game:start': () => void;
  'bet:place': (gladiatorId: string, amount: number) => void;
  'bet:skip': () => void;
}

export interface RoomResponse {
  success: boolean;
  roomCode?: string;
  sessionToken?: string;
  error?: string;
}

export interface CreateGladiatorDto {
  name: string;
  description: string;
  abilities: string[];
}

export interface PayoutInfo {
  playerId: string;
  playerName: string;
  amount: number;
  isOwnerBonus: boolean;
}
