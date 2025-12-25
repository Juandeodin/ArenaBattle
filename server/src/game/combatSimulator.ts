import { Gladiator, Match } from '../types';
import { IAIProvider } from '../services';

export class CombatSimulator {
  private aiProvider: IAIProvider;

  constructor(aiProvider: IAIProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Simula un combate entre dos gladiadores usando IA
   */
  async simulateCombat(match: Match): Promise<{ winner: Gladiator; narration: string }> {
    const { gladiator1, gladiator2 } = match;

    try {
      const result = await this.aiProvider.generateCombatNarration(
        {
          name: gladiator1.name,
          description: gladiator1.description,
          abilities: gladiator1.abilities
        },
        {
          name: gladiator2.name,
          description: gladiator2.description,
          abilities: gladiator2.abilities
        }
      );

      const winner = result.winner === 1 ? gladiator1 : gladiator2;

      return {
        winner,
        narration: result.narration
      };
    } catch (error) {
      console.error('Error en simulación de combate:', error);
      
      // Fallback: resultado aleatorio con narración genérica
      const winner = Math.random() > 0.5 ? gladiator1 : gladiator2;
      const loser = winner === gladiator1 ? gladiator2 : gladiator1;
      
      return {
        winner,
        narration: `En un combate feroz, ${winner.name} demostró su supremacía sobre ${loser.name}. ` +
          `Usando su ${winner.abilities[0] || 'fuerza'}, logró derrotar a su oponente ante el rugido de la multitud.`
      };
    }
  }
}
