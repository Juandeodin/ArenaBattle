// Tipos compartidos entre cliente y servidor

export interface Gladiator {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  ownerId: string;
  wins: number;
  losses: number;
}

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

export interface BracketMatch {
  gladiator1Name: string | null;
  gladiator2Name: string | null;
  winnerName: string | null;
  completed: boolean;
}

export interface TournamentPublicInfo {
  totalRounds: number;
  currentRound: number;
  currentMatchIndex: number;
  matchesInCurrentRound: number;
  champion: Gladiator | null;
  bracket: BracketMatch[][];
}

export type RoomStatus = 
  | 'waiting'
  | 'ready'
  | 'betting'
  | 'fighting'
  | 'results'
  | 'finished';

export interface GameState {
  roomCode: string;
  status: RoomStatus;
  players: PlayerPublicInfo[];
  currentMatch: MatchPublicInfo | null;
  tournament: TournamentPublicInfo | null;
  bettingTimeLeft: number | null;
  winners: PlayerPublicInfo[] | null;
}

export interface PayoutInfo {
  playerId: string;
  playerName: string;
  amount: number;
  isOwnerBonus: boolean;
}

export interface CreateGladiatorDto {
  name: string;
  description: string;
  abilities: string[];
}

export interface RoomResponse {
  success: boolean;
  roomCode?: string;
  sessionToken?: string;
  error?: string;
}
