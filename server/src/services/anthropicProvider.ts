import Anthropic from '@anthropic-ai/sdk';
import { IAIProvider, buildPrompt, parseAIResponse } from './aiProvider';

export class AnthropicProvider implements IAIProvider {
  private client: Anthropic;
  private model: string = 'claude-3-haiku-20240307';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateCombatNarration(
    gladiator1: { name: string; description: string; abilities: string[] },
    gladiator2: { name: string; description: string; abilities: string[] }
  ): Promise<{ narration: string; winner: 1 | 2 }> {
    const prompt = buildPrompt(gladiator1, gladiator2);
    
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';
      
      return parseAIResponse(response);
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }
}
