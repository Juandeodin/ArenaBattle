import { v4 as uuidv4 } from 'uuid';
import { Gladiator, Match, TournamentBracket, BracketMatch } from '../types';

export class TournamentEngine {
  /**
   * Crea un bracket de torneo para cualquier número de gladiadores (2-16)
   * Maneja "byes" automáticamente para números impares
   */
  static createBracket(gladiators: Gladiator[]): TournamentBracket {
    if (gladiators.length < 2) {
      throw new Error('Se necesitan al menos 2 gladiadores para un torneo');
    }

    // Mezclar gladiadores aleatoriamente
    const shuffled = [...gladiators].sort(() => Math.random() - 0.5);
    
    // Calcular el número de rondas necesarias
    const totalRounds = Math.ceil(Math.log2(shuffled.length));
    
    // Calcular el tamaño del bracket (potencia de 2 más cercana hacia arriba)
    const bracketSize = Math.pow(2, totalRounds);
    
    // Crear primera ronda con byes
    const firstRoundMatches: Match[] = [];
    const byesNeeded = bracketSize - shuffled.length;
    
    // Los gladiadores con "bye" avanzan automáticamente
    // Distribuir byes uniformemente
    let gladiatorIndex = 0;
    
    for (let i = 0; i < bracketSize / 2; i++) {
      const g1 = shuffled[gladiatorIndex++];
      const g2 = gladiatorIndex < shuffled.length ? shuffled[gladiatorIndex++] : null;
      
      if (g2 === null) {
        // Bye: el gladiador 1 gana automáticamente
        firstRoundMatches.push({
          id: uuidv4(),
          gladiator1: g1,
          gladiator2: { ...g1, id: 'bye', name: 'BYE', description: '', abilities: [], ownerId: '', wins: 0, losses: 0 },
          winner: g1,
          narration: `${g1.name} avanza sin oponente.`,
          bets: [],
          round: 1
        });
      } else {
        firstRoundMatches.push({
          id: uuidv4(),
          gladiator1: g1,
          gladiator2: g2,
          winner: null,
          narration: '',
          bets: [],
          round: 1
        });
      }
    }

    // Crear estructura de rondas vacías
    const rounds: Match[][] = [firstRoundMatches];
    
    let matchesInRound = firstRoundMatches.length / 2;
    for (let round = 2; round <= totalRounds; round++) {
      const roundMatches: Match[] = [];
      for (let i = 0; i < matchesInRound; i++) {
        roundMatches.push({
          id: uuidv4(),
          gladiator1: null as any,
          gladiator2: null as any,
          winner: null,
          narration: '',
          bets: [],
          round
        });
      }
      rounds.push(roundMatches);
      matchesInRound = matchesInRound / 2;
    }

    return {
      rounds,
      currentRound: 0,
      currentMatchIndex: 0,
      champion: null
    };
  }

  /**
   * Obtiene el siguiente combate pendiente (que no sea bye)
   */
  static getNextMatch(bracket: TournamentBracket): Match | null {
    for (let roundIdx = bracket.currentRound; roundIdx < bracket.rounds.length; roundIdx++) {
      const round = bracket.rounds[roundIdx];
      const startIdx = roundIdx === bracket.currentRound ? bracket.currentMatchIndex : 0;
      
      for (let matchIdx = startIdx; matchIdx < round.length; matchIdx++) {
        const match = round[matchIdx];
        
        // Saltar byes y combates ya completados
        if (match.winner === null && match.gladiator1 && match.gladiator2 && match.gladiator2.id !== 'bye') {
          bracket.currentRound = roundIdx;
          bracket.currentMatchIndex = matchIdx;
          return match;
        }
      }
    }
    
    return null;
  }

  /**
   * Registra el resultado de un combate y actualiza el bracket
   */
  static setMatchResult(bracket: TournamentBracket, matchId: string, winner: Gladiator, narration: string): void {
    // Encontrar el match
    for (let roundIdx = 0; roundIdx < bracket.rounds.length; roundIdx++) {
      const round = bracket.rounds[roundIdx];
      const matchIdx = round.findIndex(m => m.id === matchId);
      
      if (matchIdx !== -1) {
        const match = round[matchIdx];
        match.winner = winner;
        match.narration = narration;
        
        // Actualizar estadísticas de gladiadores
        winner.wins++;
        const loser = match.gladiator1.id === winner.id ? match.gladiator2 : match.gladiator1;
        if (loser.id !== 'bye') {
          loser.losses++;
        }
        
        // Propagar ganador a la siguiente ronda
        if (roundIdx < bracket.rounds.length - 1) {
          const nextRound = bracket.rounds[roundIdx + 1];
          const nextMatchIdx = Math.floor(matchIdx / 2);
          const nextMatch = nextRound[nextMatchIdx];
          
          if (matchIdx % 2 === 0) {
            nextMatch.gladiator1 = winner;
          } else {
            nextMatch.gladiator2 = winner;
          }
        } else {
          // Es la final, tenemos campeón
          bracket.champion = winner;
        }
        
        // Avanzar al siguiente combate
        bracket.currentMatchIndex = matchIdx + 1;
        if (bracket.currentMatchIndex >= round.length) {
          bracket.currentRound++;
          bracket.currentMatchIndex = 0;
        }
        
        return;
      }
    }
  }

  /**
   * Verifica si el torneo ha terminado
   */
  static isTournamentComplete(bracket: TournamentBracket): boolean {
    return bracket.champion !== null;
  }

  /**
   * Convierte el bracket a formato público (sin datos sensibles)
   */
  static toBracketPublic(bracket: TournamentBracket): BracketMatch[][] {
    return bracket.rounds.map(round =>
      round.map(match => ({
        gladiator1Name: match.gladiator1?.name || null,
        gladiator2Name: match.gladiator2?.id === 'bye' ? null : (match.gladiator2?.name || null),
        winnerName: match.winner?.name || null,
        completed: match.winner !== null
      }))
    );
  }

  /**
   * Cuenta los combates reales (sin byes) en la ronda actual
   */
  static getRealMatchesInRound(bracket: TournamentBracket): number {
    const round = bracket.rounds[bracket.currentRound];
    if (!round) return 0;
    
    return round.filter(m => m.gladiator2?.id !== 'bye').length;
  }
}
