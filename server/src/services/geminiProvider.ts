import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider, buildPrompt, parseAIResponse } from './aiProvider';

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI;
  private model: string = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateCombatNarration(
    gladiator1: { name: string; description: string; abilities: string[] },
    gladiator2: { name: string; description: string; abilities: string[] }
  ): Promise<{ narration: string; winner: 1 | 2 }> {
    const prompt = buildPrompt(gladiator1, gladiator2);
    
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return parseAIResponse(response);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}
