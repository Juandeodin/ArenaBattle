import OpenAI from 'openai';
import { IAIProvider, buildPrompt, parseAIResponse } from './aiProvider';

export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;
  private model: string = 'gpt-4o-mini';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCombatNarration(
    gladiator1: { name: string; description: string; abilities: string[] },
    gladiator2: { name: string; description: string; abilities: string[] }
  ): Promise<{ narration: string; winner: 1 | 2 }> {
    const prompt = buildPrompt(gladiator1, gladiator2);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '';
      return parseAIResponse(response);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}
