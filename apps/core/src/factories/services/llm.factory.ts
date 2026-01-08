import { ILLMService, LLMService } from '@/llm/src';

export class LLMServiceFactory {
  static create(): ILLMService {
    return new LLMService();
  }
}
