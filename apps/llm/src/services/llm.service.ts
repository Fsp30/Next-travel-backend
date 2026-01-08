import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateTravelGuideInput, GenerateTravelGuideOutput } from '../types';
import { LLMConfig, ModelCosts } from '../config';
import { PromptBuilder } from '../prompts/prompt-builder';
import { ILLMService } from '../interfaces/llm.service.inteface';

export class GeminiLLMService implements ILLMService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(LLMConfig.apiKey);
  }

  async generateTravelGuide(
    input: GenerateTravelGuideInput
  ): Promise<GenerateTravelGuideOutput> {
    const startTime = Date.now();
    const builder = new PromptBuilder()
      .withSystemPrompt()
      .withTravelGuideRequest(input);
    const { systemInstruction, contents } = builder.build();

    const model = this.genAI.getGenerativeModel({
      model: LLMConfig.model,
      systemInstruction: systemInstruction,
    });

    try {
      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: LLMConfig.temperature,
          maxOutputTokens: LLMConfig.maxTokens,
          topP: LLMConfig.topP,
        },
      });

      const response = await result.response;
      const text = response.text();

      // O Gemini retorna metadados de uso no 'usageMetadata'
      const usage = response.usageMetadata;
      const promptTokens = usage?.promptTokenCount || 0;
      const completionTokens = usage?.candidatesTokenCount || 0;
      const totalTokens = usage?.totalTokenCount || 0;

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
    } catch (error) {
      console.error('[GeminiLLMService] Erro:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: LLMConfig.model });
      await model.countTokens('test');
      return true;
    } catch {
      return false;
    }
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
      (promptTokens / 1000) * costs.input +
      (completionTokens / 1000) * costs.output
    );
  }
}
