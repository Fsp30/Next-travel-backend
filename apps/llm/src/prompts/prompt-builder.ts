import { GenerateTravelGuideInput } from '../types';
import {
  generateSystemPrompt,
  generateUserPrompt,
} from './guide-generator.propmt';
import { OpenAI } from 'openai';

export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

export class PrompBuilder {
  private messages: ChatMessage[] = [];

  withSystemPrompt(customPrompt?: string): this {
    const prompt = customPrompt || generateSystemPrompt();
    this.messages.push({
      role: 'system',
      content: prompt,
    });
    return this;
  }

  withTravelGuideRequest(input: GenerateTravelGuideInput): this {
    const prompt = generateUserPrompt(input);
    this.messages.push({
      role: 'user',
      content: prompt,
    });
    return this;
  }

  withCustomMessage(
    role: 'system' | 'user' | 'assistant',
    content: string
  ): this {
    this.messages.push({ role, content });
    return this;
  }

  build(): ChatMessage[] {
    if (this.messages.length === 0) {
      throw new Error('[PromptBuilder] Nenhuma mensagem adicionada');
    }
    return [...this.messages];
  }

  reset(): this {
    this.messages = [];
    return this;
  }

  getMessageCount(): number {
    return this.messages.length;
  }
}

export function buildTravelGuidePrompt(
  input: GenerateTravelGuideInput
): ChatMessage[] {
  return new PrompBuilder()
    .withSystemPrompt()
    .withTravelGuideRequest(input)
    .build();
}
