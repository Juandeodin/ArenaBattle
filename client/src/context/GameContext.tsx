import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socketService } from '../services/socket';
import { GameState, PlayerPublicInfo, MatchPublicInfo, PayoutInfo, Gladiator } from '../types';

interface GameContextType {
  // Estado del juego
  gameState: GameState | null;
  currentPlayer: PlayerPublicInfo | null;
  sessionToken: string | null;
  isConnected: boolean;
  error: string | null;
  
  // Narración y countdown
  narration: string;
  countdown: number | null;
  lastPayouts: PayoutInfo[];
  
  // Acciones
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  leaveRoom: () => void;
  createGladiator: (name: string, description: string, abilities: string[]) => void;
  startGame: () => void;
  placeBet: (gladiatorId: string, amount: number) => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const SESSION_TOKEN_KEY = 'arena_battle_session';
const PLAYER_NAME_KEY = 'arena_battle_player_name';

export function GameProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => 
    localStorage.getItem(SESSION_TOKEN_KEY)
  );
  const [playerName, setPlayerName] = useState<string>(() =>
    localStorage.getItem(PLAYER_NAME_KEY) || ''
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narration, setNarration] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastPayouts, setLastPayouts] = useState<PayoutInfo[]>([]);

  // Obtener jugador actual
  const currentPlayer = gameState?.players.find(p => {
    // Buscar por nombre si no tenemos otra forma de identificar
    return p.name === playerName;
  }) || null;

  // Conectar socket al montar
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Configurar listeners de eventos
  useEffect(() => {
    const unsubGameState = socketService.onGameState((state) => {
      setGameState(state);
      
      // Navegar según el estado
      const currentPath = location.pathname;
      const roomCode = state.roomCode;
      
      if (state.status === 'waiting' || state.status === 'ready') {
        if (!currentPath.includes('/lobby/')) {
          navigate(`/lobby/${roomCode}`);
        }
      } else if (state.status === 'finished') {
        if (!currentPath.includes('/victory/')) {
          navigate(`/victory/${roomCode}`);
        }
      } else if (['betting', 'fighting', 'results'].includes(state.status)) {
        if (!currentPath.includes('/arena/')) {
          navigate(`/arena/${roomCode}`);
        }
      }
    });

    const unsubError = socketService.onGameError((message) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    const unsubNarration = socketService.onNarration((text) => {
      setNarration(text);
    });

    const unsubCountdown = socketService.onCountdown((seconds) => {
      setCountdown(seconds);
    });

    const unsubMatchResult = socketService.onMatchResult((match: MatchPublicInfo, payouts: PayoutInfo[]) => {
      setLastPayouts(payouts);
      setNarration(match.narration);
    });

    const unsubTournamentEnd = socketService.onTournamentEnd((winners: PlayerPublicInfo[], champion: Gladiator) => {
      console.log('Torneo terminado!', { winners, champion });
    });

    return () => {
      unsubGameState();
      unsubError();
      unsubNarration();
      unsubCountdown();
      unsubMatchResult();
      unsubTournamentEnd();
    };
  }, [navigate, location.pathname]);

  // Crear sala
  const createRoom = useCallback(async (name: string) => {
    setPlayerName(name);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    
    const response = await socketService.createRoom(name);
    
    if (response.success && response.sessionToken && response.roomCode) {
      setSessionToken(response.sessionToken);
      localStorage.setItem(SESSION_TOKEN_KEY, response.sessionToken);
      navigate(`/lobby/${response.roomCode}`);
    } else {
      setError(response.error || 'Error al crear sala');
    }
  }, [navigate]);

  // Unirse a sala
  const joinRoom = useCallback(async (roomCode: string, name: string) => {
    setPlayerName(name);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    
    const response = await socketService.joinRoom(roomCode, name, sessionToken);
    
    if (response.success && response.sessionToken && response.roomCode) {
      setSessionToken(response.sessionToken);
      localStorage.setItem(SESSION_TOKEN_KEY, response.sessionToken);
      navigate(`/lobby/${response.roomCode}`);
    } else {
      setError(response.error || 'Error al unirse a la sala');
    }
  }, [navigate, sessionToken]);

  // Salir de sala
  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setGameState(null);
    setNarration('');
    setCountdown(null);
    setLastPayouts([]);
    navigate('/');
  }, [navigate]);

  // Crear gladiador
  const createGladiator = useCallback((name: string, description: string, abilities: string[]) => {
    socketService.createGladiator({ name, description, abilities });
  }, []);

  // Iniciar juego
  const startGame = useCallback(() => {
    socketService.startGame();
  }, []);

  // Realizar apuesta
  const placeBet = useCallback((gladiatorId: string, amount: number) => {
    socketService.placeBet(gladiatorId, amount);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: GameContextType = {
    gameState,
    currentPlayer,
    sessionToken,
    isConnected,
    error,
    narration,
    countdown,
    lastPayouts,
    createRoom,
    joinRoom,
    leaveRoom,
    createGladiator,
    startGame,
    placeBet,
    clearError,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de GameProvider');
  }
  return context;
}
