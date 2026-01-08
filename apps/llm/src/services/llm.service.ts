import axios, { AxiosInstance } from 'axios';
import { GenerateTravelGuideInput, GenerateTravelGuideOutput } from '../types';
import { LLMConfig, ModelCosts } from '../config';
import { PromptBuilder } from '../prompts/prompt-builder';
import { ILLMService } from '../interfaces/llm.service.inteface';

export class LLMService implements ILLMService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: LLMConfig.groq?.baseURL || 'https://api.groq.com/openai/v1',
      headers: {
        Authorization: `Bearer ${LLMConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: LLMConfig.timeout,
    });
  }

  async generateTravelGuide(
    input: GenerateTravelGuideInput
  ): Promise<GenerateTravelGuideOutput> {
    const startTime = Date.now();

    const builder = new PromptBuilder()
      .withSystemPrompt()
      .withTravelGuideRequest(input);
    const { systemInstruction, contents } = builder.build();

    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: this.extractUserContent(contents) },
    ];

    try {
      const response = await this.client.post('/chat/completions', {
        model: LLMConfig.model,
        messages: messages,
        temperature: LLMConfig.temperature,
        max_tokens: LLMConfig.maxTokens,
        top_p: LLMConfig.topP,
      });

      const data = response.data;
      const text = data.choices[0].message.content;

      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || 0;

      return {
        text,
        metadata: {
          model: LLMConfig.model,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost: this.calculateCost(promptTokens, completionTokens),
          generatedAt: new Date(),
          responseTime: Date.now() - startTime,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[GroqLLMService] Erro:', error.message);

        if (error.message.includes('limit')) {
          console.warn('Rate limit excedido. Aguardando...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.generateTravelGuide(input);
        }
      }

      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.post(
        '/chat/completions',
        {
          model: LLMConfig.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        },
        { timeout: 5000 }
      );
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[GroqLLMService] Health check:', error.message);
        return false;
      }

      return true;
    }
  }

  private extractUserContent(contents: any[]): string {
    if (
      contents.length > 0 &&
      contents[0].parts &&
      contents[0].parts.length > 0
    ) {
      return contents[0].parts.map((part: any) => part.text).join('\n');
    }
    return '';
  }

  private calculateCost(
    promptTokens: number,
    completionTokens: number
  ): number {
    const costs = ModelCosts[LLMConfig.model as keyof typeof ModelCosts] || {
      input: 0,
      output: 0,
    };
    return (
      (promptTokens / 1000000) * costs.input +
      (completionTokens / 1000000) * costs.output
    );
  }
}
