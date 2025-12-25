import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Trophy, Crown, Coins, Swords, RotateCcw, Home } from 'lucide-react';

export default function Victory() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { gameState, leaveRoom } = useGame();

  const winners = gameState?.winners || [];
  const champion = gameState?.tournament?.champion;
  const sortedPlayers = [...(gameState?.players || [])].sort((a, b) => b.coins - a.coins);

  const handleGoHome = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Confetti effect via CSS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#ffd700', '#c4a35a', '#8b0000', '#cd7f32'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Título */}
      <div className="text-center mb-8 animate-float">
        <Trophy className="w-20 h-20 text-gold-400 mx-auto mb-4" />
        <h1 className="font-roman text-5xl md:text-6xl text-gold-glow mb-2">
          ¡TORNEO FINALIZADO!
        </h1>
        <p className="text-arena-300 text-xl">
          La arena ha decidido sus campeones
        </p>
      </div>

      {/* Campeón del torneo (gladiador) */}
      {champion && (
        <div className="card-gold p-6 mb-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Swords className="w-6 h-6 text-gold-400" />
            <h2 className="font-roman text-2xl text-gold-400">Campeón de la Arena</h2>
            <Swords className="w-6 h-6 text-gold-400" />
          </div>
          <h3 className="font-roman text-3xl text-arena-100 mb-2">{champion.name}</h3>
          <p className="text-arena-300 mb-4">{champion.description}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {champion.abilities.map((ability, i) => (
              <span key={i} className="badge-ability">{ability}</span>
            ))}
          </div>
          <p className="mt-4 text-gold-400">
            Victorias: {champion.wins} | Derrotas: {champion.losses}
          </p>
        </div>
      )}

      {/* Ganadores (más dinero) */}
      <div className="card-stone p-6 mb-8 max-w-2xl w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-6 h-6 text-gold-400" />
          <h2 className="font-roman text-2xl text-gold-400">
            {winners.length > 1 ? '¡Ganadores Empatados!' : '¡Ganador del Torneo!'}
          </h2>
          <Crown className="w-6 h-6 text-gold-400" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {winners.map((winner) => (
            <div 
              key={winner.id}
              className="text-center p-4 bg-gradient-to-br from-gold-400/20 to-gold-600/10 rounded-xl border-2 border-gold-400"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gold-400 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-arena-900" />
              </div>
              <h3 className="font-roman text-xl text-arena-100">{winner.name}</h3>
              {winner.gladiator && (
                <p className="text-arena-400 text-sm">⚔️ {winner.gladiator.name}</p>
              )}
              <div className="flex items-center justify-center gap-1 mt-2">
                <Coins className="w-5 h-5 text-gold-400" />
                <span className="font-bold text-gold-400 text-2xl">{winner.coins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clasificación final */}
      <div className="card-stone p-6 mb-8 max-w-md w-full">
        <h2 className="font-roman text-xl text-gold-400 mb-4 text-center">
          Clasificación Final
        </h2>
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-gold-400/20 border border-gold-400' :
                index === 1 ? 'bg-gray-400/10 border border-gray-400/50' :
                index === 2 ? 'bg-bronze-400/10 border border-bronze-400/50' :
                'bg-arena-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                  index === 0 ? 'bg-gold-400 text-arena-900' :
                  index === 1 ? 'bg-gray-400 text-arena-900' :
                  index === 2 ? 'bg-bronze-400 text-arena-900' :
                  'bg-arena-700 text-arena-300'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-arena-100 font-medium">{player.name}</p>
                  {player.gladiator && (
                    <p className="text-arena-500 text-xs">{player.gladiator.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 font-bold">{player.coins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={handleGoHome}
          className="btn-stone flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </button>
      </div>

      {/* Código de sala */}
      <p className="mt-8 text-arena-500 text-sm">
        Sala: {roomCode}
      </p>
    </div>
  );
}
