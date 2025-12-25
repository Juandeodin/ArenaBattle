import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Swords, Users, Plus, LogIn } from 'lucide-react';

export default function Home() {
  const { createRoom, joinRoom, error, isConnected } = useGame();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setIsLoading(true);
    await createRoom(playerName.trim());
    setIsLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setIsLoading(true);
    await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo y título */}
      <div className="text-center mb-12 animate-float">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Swords className="w-16 h-16 text-gold-400" />
        </div>
        <h1 className="font-roman text-6xl md:text-7xl font-bold text-gold-glow mb-4">
          ARENA BATTLE
        </h1>
        <p className="text-arena-300 text-xl font-roman">
          Combate de Gladiadores
        </p>
      </div>

      {/* Estado de conexión */}
      <div className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-full ${
        isConnected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
        <span className="text-sm">{isConnected ? 'Conectado' : 'Conectando...'}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-6 py-3 bg-blood-500/30 border border-blood-400 rounded-lg text-blood-300">
          {error}
        </div>
      )}

      {/* Panel principal */}
      <div className="card-stone p-8 w-full max-w-md">
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              disabled={!isConnected}
              className="btn-gold w-full flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Crear Sala
            </button>
            
            <button
              onClick={() => setMode('join')}
              disabled={!isConnected}
              className="btn-stone w-full flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              Unirse a Sala
            </button>

            <div className="pt-6 border-t border-arena-600 mt-6">
              <div className="flex items-center gap-2 text-arena-400 text-sm mb-4">
                <Users className="w-4 h-4" />
                <span>2-16 jugadores por partida</span>
              </div>
              <p className="text-arena-500 text-xs text-center">
                Crea tu gladiador, apuesta en combates y conquista el torneo
              </p>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6">
            <h2 className="font-roman text-2xl text-gold-400 text-center mb-6">
              Crear Nueva Sala
            </h2>
            
            <div>
              <label className="block text-arena-300 mb-2 text-sm">Tu nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                className="input-arena"
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode('menu')}
                className="btn-stone flex-1"
              >
                Volver
              </button>
              <button
                onClick={handleCreate}
                disabled={!playerName.trim() || isLoading}
                className="btn-gold flex-1"
              >
                {isLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-6">
            <h2 className="font-roman text-2xl text-gold-400 text-center mb-6">
              Unirse a Sala
            </h2>
            
            <div>
              <label className="block text-arena-300 mb-2 text-sm">Tu nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                className="input-arena"
                maxLength={20}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-arena-300 mb-2 text-sm">Código de sala</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className="input-arena text-center tracking-widest text-xl"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode('menu')}
                className="btn-stone flex-1"
              >
                Volver
              </button>
              <button
                onClick={handleJoin}
                disabled={!playerName.trim() || !roomCode.trim() || isLoading}
                className="btn-gold flex-1"
              >
                {isLoading ? 'Uniendo...' : 'Unirse'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-arena-600 text-sm">
        ⚔️ ¡Que comiencen los juegos! ⚔️
      </p>
    </div>
  );
}
