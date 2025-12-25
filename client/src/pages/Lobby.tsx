import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { 
  Crown, 
  Sword, 
  Users, 
  Copy, 
  Check, 
  LogOut,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { 
    gameState, 
    currentPlayer, 
    createGladiator, 
    startGame, 
    leaveRoom,
    error 
  } = useGame();
  
  const [gladiatorName, setGladiatorName] = useState('');
  const [gladiatorDesc, setGladiatorDesc] = useState('');
  const [abilities, setAbilities] = useState(['', '', '']);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAbilityChange = (index: number, value: string) => {
    const newAbilities = [...abilities];
    newAbilities[index] = value;
    setAbilities(newAbilities);
  };

  const handleCreateGladiator = () => {
    if (!gladiatorName.trim() || !gladiatorDesc.trim()) return;
    
    const validAbilities = abilities.filter(a => a.trim()).slice(0, 3);
    if (validAbilities.length === 0) return;
    
    createGladiator(gladiatorName.trim(), gladiatorDesc.trim(), validAbilities);
  };

  const canStart = gameState?.status === 'ready' && currentPlayer?.isHost;
  const allPlayersReady = gameState?.players.every(p => p.gladiator !== null);
  const playerCount = gameState?.players.length || 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Sword className="w-10 h-10 text-gold-400" />
          <div>
            <h1 className="font-roman text-3xl text-gold-400">Sala de Preparación</h1>
            <p className="text-arena-400 text-sm">Prepara tu gladiador para la batalla</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Código de sala */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 bg-arena-800 border-2 border-gold-400 rounded-lg hover:bg-arena-700 transition-colors"
          >
            <span className="font-mono text-xl text-gold-400 tracking-widest">{roomCode}</span>
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-arena-400" />
            )}
          </button>
          
          <button
            onClick={leaveRoom}
            className="p-2 text-arena-400 hover:text-blood-400 transition-colors"
            title="Salir de la sala"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-6 px-6 py-3 bg-blood-500/30 border border-blood-400 rounded-lg text-blood-300 text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Panel izquierdo: Crear gladiador */}
        <div className="card-stone p-6">
          <h2 className="font-roman text-2xl text-gold-400 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            {currentPlayer?.gladiator ? 'Tu Gladiador' : 'Crear Gladiador'}
          </h2>

          {currentPlayer?.gladiator ? (
            // Mostrar gladiador creado
            <div className="space-y-4">
              <div className="p-4 bg-arena-900/50 rounded-lg border border-gold-400/30">
                <h3 className="font-roman text-2xl text-gold-400 mb-2">
                  {currentPlayer.gladiator.name}
                </h3>
                <p className="text-arena-200 mb-4">
                  {currentPlayer.gladiator.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlayer.gladiator.abilities.map((ability, i) => (
                    <span key={i} className="badge-ability">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-center text-arena-400 text-sm">
                ✓ Gladiador listo para el combate
              </p>
            </div>
          ) : (
            // Formulario de creación
            <div className="space-y-4">
              <div>
                <label className="block text-arena-300 mb-2 text-sm">Nombre del Gladiador</label>
                <input
                  type="text"
                  value={gladiatorName}
                  onChange={(e) => setGladiatorName(e.target.value)}
                  placeholder="Ej: Maximus el Invicto"
                  className="input-arena"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-arena-300 mb-2 text-sm">Descripción</label>
                <textarea
                  value={gladiatorDesc}
                  onChange={(e) => setGladiatorDesc(e.target.value)}
                  placeholder="Describe a tu gladiador: su aspecto, personalidad, estilo de lucha..."
                  className="textarea-arena h-24"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-arena-300 mb-2 text-sm">
                  Habilidades (3 máximo)
                </label>
                <div className="space-y-2">
                  {abilities.map((ability, i) => (
                    <input
                      key={i}
                      type="text"
                      value={ability}
                      onChange={(e) => handleAbilityChange(i, e.target.value)}
                      placeholder={`Habilidad ${i + 1}: Ej: Fuerza sobrehumana`}
                      className="input-arena"
                      maxLength={30}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateGladiator}
                disabled={!gladiatorName.trim() || !gladiatorDesc.trim() || abilities.filter(a => a.trim()).length === 0}
                className="btn-gold w-full mt-4"
              >
                Crear Gladiador
              </button>
            </div>
          )}
        </div>

        {/* Panel derecho: Lista de jugadores */}
        <div className="card-stone p-6">
          <h2 className="font-roman text-2xl text-gold-400 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Jugadores ({playerCount}/16)
          </h2>

          <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
            {gameState?.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  player.gladiator
                    ? 'bg-arena-800/50 border-gold-400/50'
                    : 'bg-arena-900/30 border-arena-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {player.isHost && (
                      <Crown className="w-5 h-5 text-gold-400" />
                    )}
                    <div>
                      <p className="font-semibold text-arena-100">
                        {player.name}
                        {player.id === currentPlayer?.id && (
                          <span className="text-gold-400 text-sm ml-2">(Tú)</span>
                        )}
                      </p>
                      {player.gladiator && (
                        <p className="text-sm text-arena-400">
                          ⚔️ {player.gladiator.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {player.isConnected ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    {player.gladiator ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-arena-500 rounded animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estado y botón de iniciar */}
          <div className="border-t border-arena-600 pt-4">
            {playerCount < 2 ? (
              <p className="text-center text-arena-400 mb-4">
                Esperando más jugadores... (mínimo 2)
              </p>
            ) : !allPlayersReady ? (
              <p className="text-center text-arena-400 mb-4">
                Esperando que todos creen su gladiador...
              </p>
            ) : (
              <p className="text-center text-green-400 mb-4">
                ¡Todos listos para la batalla!
              </p>
            )}

            {currentPlayer?.isHost ? (
              <button
                onClick={startGame}
                disabled={!canStart}
                className="btn-gold w-full"
              >
                {canStart ? '⚔️ ¡Comenzar Torneo!' : 'Esperando jugadores...'}
              </button>
            ) : (
              <p className="text-center text-arena-500 text-sm">
                El anfitrión iniciará el torneo cuando todos estén listos
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
