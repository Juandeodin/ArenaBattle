// Interfaz abstracta para proveedores de IA

export interface IAIProvider {
  generateCombatNarration(
    gladiator1: { name: string; description: string; abilities: string[] },
    gladiator2: { name: string; description: string; abilities: string[] }
  ): Promise<{ narration: string; winner: 1 | 2 }>;
}

export const COMBAT_PROMPT = `Eres un narrador épico de combates de gladiadores en un coliseo romano fantástico.
Debes narrar un combate entre dos gladiadores y determinar un ganador.

GLADIADOR 1:
Nombre: {gladiator1_name}
Descripción: {gladiator1_description}
Habilidades: {gladiator1_abilities}

GLADIADOR 2:
Nombre: {gladiator2_name}
Descripción: {gladiator2_description}
Habilidades: {gladiator2_abilities}

INSTRUCCIONES:
1. Narra un combate épico pero BREVE (máximo 100 palabras)
2. Usa lenguaje dramático y fantástico
3. Menciona las habilidades de ambos gladiadores
4. El combate debe ser emocionante con momentos de tensión
5. Declara un ganador claro al final

FORMATO DE RESPUESTA (JSON):
{
  "narration": "Tu narración épica aquí...",
  "winner": 1 o 2
}

Responde SOLO con el JSON, sin texto adicional.`;

export function buildPrompt(
  gladiator1: { name: string; description: string; abilities: string[] },
  gladiator2: { name: string; description: string; abilities: string[] }
): string {
  return COMBAT_PROMPT
    .replace('{gladiator1_name}', gladiator1.name)
    .replace('{gladiator1_description}', gladiator1.description)
    .replace('{gladiator1_abilities}', gladiator1.abilities.join(', '))
    .replace('{gladiator2_name}', gladiator2.name)
    .replace('{gladiator2_description}', gladiator2.description)
    .replace('{gladiator2_abilities}', gladiator2.abilities.join(', '));
}

export function parseAIResponse(response: string): { narration: string; winner: 1 | 2 } {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.narration || !parsed.winner) {
      throw new Error('Invalid response structure');
    }
    
    const winner = Number(parsed.winner);
    if (winner !== 1 && winner !== 2) {
      throw new Error('Invalid winner value');
    }
    
    return {
      narration: parsed.narration,
      winner: winner as 1 | 2
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Fallback: generar resultado aleatorio
    return {
      narration: 'Un combate feroz tuvo lugar en la arena. Ambos gladiadores lucharon con valentía, pero solo uno pudo alzarse victorioso tras una batalla épica.',
      winner: Math.random() > 0.5 ? 1 : 2
    };
  }
}
