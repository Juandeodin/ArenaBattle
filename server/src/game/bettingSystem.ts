import { Bet, Player, Match, PayoutInfo, GameConfig } from '../types';

export class BettingSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * Valida y registra una apuesta
   */
  placeBet(
    player: Player,
    gladiatorId: string,
    amount: number,
    match: Match
  ): { success: boolean; error?: string } {
    // Validar que el gladiador está en el combate
    if (match.gladiator1.id !== gladiatorId && match.gladiator2.id !== gladiatorId) {
      return { success: false, error: 'El gladiador no está en este combate' };
    }

    // Validar monto mínimo
    if (amount < this.config.minBet) {
      return { success: false, error: `Apuesta mínima: ${this.config.minBet} monedas` };
    }

    // Validar que tiene suficientes monedas
    if (amount > player.coins) {
      return { success: false, error: 'No tienes suficientes monedas' };
    }

    // Verificar si ya apostó en este combate
    const existingBetIndex = match.bets.findIndex(b => b.playerId === player.id);
    if (existingBetIndex !== -1) {
      // Devolver la apuesta anterior
      player.coins += match.bets[existingBetIndex].amount;
      match.bets.splice(existingBetIndex, 1);
    }

    // Registrar nueva apuesta
    player.coins -= amount;
    match.bets.push({
      playerId: player.id,
      gladiatorId,
      amount
    });

    return { success: true };
  }

  /**
   * Calcula el pool total de apuestas
   */
  getTotalPool(match: Match): number {
    return match.bets.reduce((sum, bet) => sum + bet.amount, 0);
  }

  /**
   * Calcula el pool apostado a un gladiador específico
   */
  getPoolForGladiator(match: Match, gladiatorId: string): number {
    return match.bets
      .filter(bet => bet.gladiatorId === gladiatorId)
      .reduce((sum, bet) => sum + bet.amount, 0);
  }

  /**
   * Distribuye las ganancias después de un combate
   */
  distributePayout(
    match: Match,
    winnerId: string,
    players: Map<string, Player>
  ): PayoutInfo[] {
    const payouts: PayoutInfo[] = [];
    const totalPool = this.getTotalPool(match);
    
    if (totalPool === 0) {
      return payouts;
    }

    // Encontrar apuestas ganadoras
    const winningBets = match.bets.filter(bet => bet.gladiatorId === winnerId);
    const winningPool = this.getPoolForGladiator(match, winnerId);
    
    if (winningPool === 0) {
      // Nadie apostó al ganador, el dinero se pierde (o se podría devolver)
      return payouts;
    }

    // Calcular y distribuir ganancias proporcionales
    for (const bet of winningBets) {
      const player = players.get(bet.playerId);
      if (!player) continue;

      // Proporción de las ganancias basada en la apuesta
      const proportion = bet.amount / winningPool;
      let winnings = Math.floor(totalPool * proportion);
      
      // Bonus si es tu propio gladiador
      const isOwner = player.gladiator?.id === winnerId;
      if (isOwner) {
        const bonus = Math.floor(winnings * (this.config.ownerBonus / 100));
        winnings += bonus;
        
        payouts.push({
          playerId: player.id,
          playerName: player.name,
          amount: winnings,
          isOwnerBonus: true
        });
      } else {
        payouts.push({
          playerId: player.id,
          playerName: player.name,
          amount: winnings,
          isOwnerBonus: false
        });
      }

      player.coins += winnings;
    }

    return payouts;
  }

  /**
   * Obtiene los ganadores finales del torneo (mayor cantidad de monedas)
   * Permite empates
   */
  getWinners(players: Map<string, Player>): Player[] {
    const playerArray = Array.from(players.values());
    const maxCoins = Math.max(...playerArray.map(p => p.coins));
    
    return playerArray.filter(p => p.coins === maxCoins);
  }

  /**
   * Resetea las apuestas de un jugador en un match
   */
  cancelBet(player: Player, match: Match): void {
    const betIndex = match.bets.findIndex(b => b.playerId === player.id);
    if (betIndex !== -1) {
      const bet = match.bets[betIndex];
      player.coins += bet.amount;
      match.bets.splice(betIndex, 1);
    }
  }
}
