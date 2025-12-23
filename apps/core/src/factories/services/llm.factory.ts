import { ILLMService, OpenAILLMService } from '@/llm/src';

export class LLMServiceFactory {
  static create(): ILLMService {
    return new OpenAILLMService();
  }
}
