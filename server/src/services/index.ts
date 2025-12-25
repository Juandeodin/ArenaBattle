import { IAIProvider } from './aiProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';

export type AIProviderType = 'gemini' | 'openai' | 'anthropic';

export function createAIProvider(): IAIProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase() as AIProviderType;
  
  switch (provider) {
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY no configurada');
      }
      console.log('🤖 Usando proveedor de IA: Gemini');
      return new GeminiProvider(apiKey);
    }
    
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY no configurada');
      }
      console.log('🤖 Usando proveedor de IA: OpenAI');
      return new OpenAIProvider(apiKey);
    }
    
    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY no configurada');
      }
      console.log('🤖 Usando proveedor de IA: Anthropic');
      return new AnthropicProvider(apiKey);
    }
    
    default:
      throw new Error(`Proveedor de IA no soportado: ${provider}`);
  }
}

export { IAIProvider } from './aiProvider';
