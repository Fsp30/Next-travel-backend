import { GenerateTravelGuideInput } from '../types';
import {
  generateSystemPrompt,
  generateUserPrompt,
} from './guide-generator.propmt';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
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

  build() {
    return {
      systemInstruction: this.systemInstruction,
      contents: this.messages,
    };
  }
}
