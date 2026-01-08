import { GenerateTravelGuideInput } from '../types';
import {
  generateSystemPrompt,
  generateUserPrompt,
} from './guide-generator.propmt';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiPromptPayload {
  systemInstruction: string;
  contents: GeminiMessage[];
}

export class PromptBuilder {
  private messages: GeminiMessage[] = [];
  private systemInstruction: string = '';

  withSystemPrompt(customPrompt?: string): this {
    this.systemInstruction = customPrompt || generateSystemPrompt();
    return this;
  }

  withTravelGuideRequest(input: GenerateTravelGuideInput): this {
    this.messages.push({
      role: 'user',
      parts: [{ text: generateUserPrompt(input) }],
    });
    return this;
  }

  build(): GeminiPromptPayload {
    if (this.messages.length === 0) {
      throw new Error('[PromptBuilder] Nenhuma mensagem adicionada');
    }
    return {
      systemInstruction: this.systemInstruction,
      contents: [...this.messages],
    };
  }
}

export function buildTravelGuidePrompt(
  input: GenerateTravelGuideInput
): GeminiPromptPayload {
  return new PromptBuilder()
    .withSystemPrompt()
    .withTravelGuideRequest(input)
    .build();
}
