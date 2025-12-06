import OpenAI from 'openai';
import { GenerateTravelGuideInput, GenerateTravelGuideOutput } from '../types';
import { LLMConfig, ModelCosts } from '../config';
import { buildTravelGuidePrompt } from '../prompts';
import { ILLMService } from '../interfaces/llm.service.inteface';
import { LLMError } from '../types/llm-output.types';

export class OpenAILLMService implements ILLMService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: LLMConfig.apiKey,
      timeout: LLMConfig.timeout,
      maxRetries: LLMConfig.retries,
    });
  }

  async generateTravelGuide(
    input: GenerateTravelGuideInput
  ): Promise<GenerateTravelGuideOutput> {
    const startTime = Date.now();

    try {
      console.log('[OpenAILLMService] Gerando guia de viagem...');

      const messages = buildTravelGuidePrompt(input);

      const response = await this.client.chat.completions.create({
        model: LLMConfig.model,
        messages: messages,
        temperature: LLMConfig.temperature,
        max_tokens: LLMConfig.maxTokens,
        top_p: LLMConfig.topP,
        frequency_penalty: LLMConfig.frequencyPenalty,
        presence_penalty: LLMConfig.presencePenalty,
      });

      const text = response.choices[0]?.message?.content || '';

      if (!text) {
        throw new Error('LLM retornou resposta vazia');
      }

      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;
      const estimatedCost = this.calculateCost(promptTokens, completionTokens);
      const responseTime = Date.now() - startTime;

      console.log('[OpenAILLMService] Guia gerado com sucesso', {
        tokens: totalTokens,
        cost: `$${estimatedCost.toFixed(4)}`,
        time: `${responseTime}ms`,
      });

      return {
        text,
        metadata: {
          model: LLMConfig.model,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost,
          generatedAt: new Date(),
          responseTime,
        },
      };
    } catch (error) {
      console.error('[OpenAILLMService] Erro ao gerar guia:', error);
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('[OpenAILLMService] Health check falhou:', error);
      return false;
    }
  }

  private calculateCost(
    promptTokens: number,
    completionTokens: number
  ): number {
    const modelKey = LLMConfig.model as keyof typeof ModelCosts;
    const costs = ModelCosts[modelKey];

    if (!costs) {
      console.warn(
        `[OpenAILLMService] Custo desconhecido para modelo ${LLMConfig.model}`
      );
      return 0;
    }

    const inputCost = (promptTokens / 1000) * costs.input;
    const outputCost = (completionTokens / 1000) * costs.output;

    return inputCost + outputCost;
  }

  private handleError(error: unknown): LLMError {
    if (error instanceof OpenAI.APIError) {
      const type = this.mapErrorType(error.status);

      return {
        type,
        message: error.message,
        statusCode: error.status,
        originalError: error,
      };
    }

    if (error instanceof Error) {
      return {
        type: 'unknown',
        message: error.message,
        originalError: error,
      };
    }

    return {
      type: 'unknown',
      message: 'Erro desconhecido ao gerar guia',
      originalError: error,
    };
  }
  private mapErrorType(status?: number): LLMError['type'] {
    if (!status) return 'unknown';

    if (status === 429) return 'rate_limit';
    if (status === 408 || status === 504) return 'timeout';
    if (status >= 400 && status < 500) return 'invalid_request';
    if (status >= 500) return 'api_error';

    return 'unknown';
  }
}
