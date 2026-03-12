import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { 
  Swords, 
  Coins, 
  Timer, 
  Trophy,
  Flame,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Arena() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { 
    gameState, 
    currentPlayer, 
    narration, 
    countdown, 
    lastPayouts,
    placeBet,
    continueGame,
    error 
  } = useGame();

  const [betAmount, setBetAmount] = useState(10);
  const [selectedGladiator, setSelectedGladiator] = useState<string | null>(null);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [displayedNarration, setDisplayedNarration] = useState('');

  const currentMatch = gameState?.currentMatch;
  const isBetting = gameState?.status === 'betting';
  const isFighting = gameState?.status === 'fighting';
  const isResults = gameState?.status === 'results';

  // Efecto typewriter para la narración
  useEffect(() => {
    if (!narration) {
      setDisplayedNarration('');
      return;
    }

    let index = 0;
    setDisplayedNarration('');
    
    const timer = setInterval(() => {
      if (index < narration.length) {
        setDisplayedNarration(prev => prev + narration[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [narration]);

  // Reset al cambiar de match
  useEffect(() => {
    setHasPlacedBet(false);
    setSelectedGladiator(null);
    setBetAmount(10);
  }, [currentMatch?.id]);

  const handlePlaceBet = () => {
    if (!selectedGladiator || hasPlacedBet) return;
    placeBet(selectedGladiator, betAmount);
    setHasPlacedBet(true);
  };

  const isMyGladiator = (gladiatorId: string) => {
    return currentPlayer?.gladiator?.id === gladiatorId;
  };

  // Ordenar jugadores por monedas
  const sortedPlayers = [...(gameState?.players || [])].sort((a, b) => b.coins - a.coins);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header con info del torneo */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Swords className="w-8 h-8 text-gold-400" />
          <div>
            <h1 className="font-roman text-2xl md:text-3xl text-gold-400">
              {isBetting && '⏳ Fase de Apuestas'}
              {isFighting && '⚔️ ¡Combate!'}
              {isResults && '🏆 Resultados'}
            </h1>
            {gameState?.tournament && (
              <p className="text-arena-400 text-sm">
                Ronda {gameState.tournament.currentRound} de {gameState.tournament.totalRounds}
              </p>
            )}
          </div>
        </div>

        {/* Monedas del jugador */}
        <div className="flex items-center gap-2 px-4 py-2 bg-arena-800 border-2 border-gold-400 rounded-lg">
          <Coins className="w-5 h-5 text-gold-400" />
          <span className="font-bold text-gold-400 text-xl">{currentPlayer?.coins || 0}</span>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2 bg-blood-500/30 border border-blood-400 rounded-lg text-blood-300 text-center text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Panel de apuestas (izquierda) */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card-stone p-4 sticky top-4">
            <h2 className="font-roman text-xl text-gold-400 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Apuestas
            </h2>

            {isBetting && countdown !== null && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-gold-400" />
                  <span className={`font-bold text-3xl ${
                    countdown <= 10 ? 'text-blood-400 animate-pulse' : 'text-gold-400'
                  }`}>
                    {countdown}s
                  </span>
                </div>
                <div className="w-full bg-arena-700 rounded-full h-2">
                  <div 
                    className="bg-gold-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {isBetting && !hasPlacedBet && currentPlayer && (
              <div className="space-y-4">
                <p className="text-arena-300 text-sm">Selecciona un gladiador y apuesta:</p>
                
                {/* Selector de cantidad */}
                <div>
                  <label htmlFor="bet-amount" className="text-arena-400 text-xs mb-1 block">Cantidad</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bet-amount"
                      type="range"
                      min={10}
                      max={currentPlayer.coins}
                      step={10}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="flex-1"
                      aria-label="Cantidad de apuesta"
                    />
                    <span className="text-gold-400 font-bold w-16 text-right">{betAmount}</span>
                  </div>
                </div>

                {/* Botones rápidos */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setBetAmount(10)}
                    className="flex-1 py-1 text-xs bg-arena-700 hover:bg-arena-600 rounded text-arena-300"
                  >
                    Mín
                  </button>
                  <button
                    onClick={() => setBetAmount(Math.floor(currentPlayer.coins / 2))}
                    className="flex-1 py-1 text-xs bg-arena-700 hover:bg-arena-600 rounded text-arena-300"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setBetAmount(currentPlayer.coins)}
                    className="flex-1 py-1 text-xs bg-arena-700 hover:bg-arena-600 rounded text-arena-300"
                  >
                    Todo
                  </button>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={!selectedGladiator}
                  className="btn-gold w-full text-sm py-2"
                >
                  {selectedGladiator ? `Apostar ${betAmount} monedas` : 'Selecciona gladiador'}
                </button>
              </div>
            )}

            {hasPlacedBet && (
              <div className="text-center p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                <p className="text-green-400">✓ Apuesta realizada</p>
                <p className="text-arena-400 text-sm">{betAmount} monedas</p>
              </div>
            )}

            {(isFighting || isResults) && currentMatch && (
              <div className="text-center p-4 bg-arena-800/50 rounded-lg">
                <p className="text-arena-300 text-sm">Pool total:</p>
                <p className="text-gold-400 font-bold text-2xl">{currentMatch.totalPool}</p>
              </div>
            )}

            {/* Últimos pagos */}
            {isResults && lastPayouts.length > 0 && (
              <div className="mt-4 p-3 bg-gold-400/10 border border-gold-400/30 rounded-lg">
                <p className="text-gold-400 text-sm font-semibold mb-2">💰 Ganancias:</p>
                {lastPayouts.map((payout, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-arena-300">{payout.playerName}</span>
                    <span className={payout.isOwnerBonus ? 'text-gold-400' : 'text-green-400'}>
                      +{payout.amount} {payout.isOwnerBonus && '(+bonus)'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Botón continuar (solo host en resultados) */}
            {isResults && currentPlayer?.isHost && (
              <div className="mt-4">
                <button
                  onClick={continueGame}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Siguiente Combate
                </button>
              </div>
            )}

            {isResults && !currentPlayer?.isHost && (
              <div className="mt-4 text-center p-3 bg-arena-800/50 rounded-lg">
                <p className="text-arena-400 text-sm">
                  Esperando al host para continuar...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Arena central */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {currentMatch && (
            <div className="card-gold p-6">
              {/* VS de gladiadores */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* Gladiador 1 */}
                <div 
                  className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
                    selectedGladiator === currentMatch.gladiator1.id
                      ? 'bg-gold-400/20 border-2 border-gold-400 shadow-lg shadow-gold-400/20'
                      : 'bg-arena-800/50 border-2 border-arena-600 hover:border-arena-400'
                  } ${isMyGladiator(currentMatch.gladiator1.id) ? 'ring-2 ring-blood-500' : ''}`}
                  onClick={() => isBetting && !hasPlacedBet && setSelectedGladiator(currentMatch.gladiator1.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h3 className="font-roman text-xl text-gold-400 truncate">
                      {currentMatch.gladiator1.name}
                    </h3>
                  </div>
                  <p className="text-arena-300 text-sm mb-3 line-clamp-2">
                    {currentMatch.gladiator1.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {currentMatch.gladiator1.abilities.map((ability, i) => (
                      <span key={i} className="badge-ability text-xs">
                        {ability}
                      </span>
                    ))}
                  </div>
                  {isMyGladiator(currentMatch.gladiator1.id) && (
                    <p className="mt-2 text-blood-400 text-xs font-semibold">⚔️ Tu gladiador</p>
                  )}
                  {currentMatch.winner?.id === currentMatch.gladiator1.id && (
                    <div className="mt-2 flex items-center gap-1 text-gold-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-bold">¡GANADOR!</span>
                    </div>
                  )}
                </div>

                {/* VS */}
                <div className="flex flex-col items-center">
                  <Flame className={`w-8 h-8 ${isFighting ? 'text-orange-500 animate-pulse' : 'text-arena-500'}`} />
                  <span className="font-roman text-2xl text-gold-400">VS</span>
                  <Zap className={`w-8 h-8 ${isFighting ? 'text-yellow-500 animate-pulse' : 'text-arena-500'}`} />
                </div>

                {/* Gladiador 2 */}
                <div 
                  className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
                    selectedGladiator === currentMatch.gladiator2.id
                      ? 'bg-gold-400/20 border-2 border-gold-400 shadow-lg shadow-gold-400/20'
                      : 'bg-arena-800/50 border-2 border-arena-600 hover:border-arena-400'
                  } ${isMyGladiator(currentMatch.gladiator2.id) ? 'ring-2 ring-blood-500' : ''}`}
                  onClick={() => isBetting && !hasPlacedBet && setSelectedGladiator(currentMatch.gladiator2.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h3 className="font-roman text-xl text-gold-400 truncate">
                      {currentMatch.gladiator2.name}
                    </h3>
                  </div>
                  <p className="text-arena-300 text-sm mb-3 line-clamp-2">
                    {currentMatch.gladiator2.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {currentMatch.gladiator2.abilities.map((ability, i) => (
                      <span key={i} className="badge-ability text-xs">
                        {ability}
                      </span>
                    ))}
                  </div>
                  {isMyGladiator(currentMatch.gladiator2.id) && (
                    <p className="mt-2 text-blood-400 text-xs font-semibold">⚔️ Tu gladiador</p>
                  )}
                  {currentMatch.winner?.id === currentMatch.gladiator2.id && (
                    <div className="mt-2 flex items-center gap-1 text-gold-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-bold">¡GANADOR!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de narración */}
              <div className="narration-panel min-h-[150px]">
                {isBetting && (
                  <p className="text-arena-400 text-center italic">
                    El combate comenzará cuando termine el tiempo de apuestas...
                  </p>
                )}
                {isFighting && !displayedNarration && (
                  <p className="text-gold-400 text-center animate-pulse">
                    Los gladiadores entran a la arena...
                  </p>
                )}
                {displayedNarration && (
                  <p className="text-arena-100 leading-relaxed">
                    {displayedNarration}
                    {isFighting && <span className="animate-pulse">|</span>}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard (derecha) */}
        <div className="lg:col-span-1 order-3">
          <div className="card-stone p-4 sticky top-4">
            <h2 className="font-roman text-xl text-gold-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Clasificación
            </h2>

            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    player.id === currentPlayer?.id
                      ? 'bg-gold-400/20 border border-gold-400/50'
                      : 'bg-arena-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-gold-400 text-arena-900' :
                      index === 1 ? 'bg-gray-400 text-arena-900' :
                      index === 2 ? 'bg-bronze-400 text-arena-900' :
                      'bg-arena-700 text-arena-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-arena-100 text-sm font-medium truncate max-w-[100px]">
                        {player.name}
                      </p>
                      {player.gladiator && (
                        <p className="text-arena-500 text-xs truncate max-w-[100px]">
                          {player.gladiator.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-gold-400" />
                    <span className="text-gold-400 font-bold text-sm">{player.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
