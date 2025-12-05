export const LLMConfig = {
  model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
  apiKey: process.env.OPENAI_API_KEY || '',
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.9'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1000', 10),
  topP: parseFloat(process.env.LLM_TOP_P || '1'),
  frequencyPenalty: parseFloat(process.env.LLM_FREQUENCY_PENALTY || '0.5'),
  presencePenalty: parseFloat(process.env.LLM_PRESENCE_PENALTY || '0.5'),
  timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
  retries: parseInt(process.env.LLM_RETRIES || '2', 10),
  retryDelay: parseInt(process.env.LLM_RETRY_DELAY || '1000', 10),
  defaultLanguage: 'pt-BR',
};

export function validateLLMConfig(): void {
  if (!LLMConfig.apiKey) {
    throw new Error('[LLMConfig] API KEY não configurada');
  }

  if (LLMConfig.temperature < 0 || LLMConfig.temperature > 2) {
    throw new Error('[LLMConfig] Temperature deve estar entre 0 e 2');
  }

  if (LLMConfig.maxTokens < 1) {
    throw new Error('[LLMConfig] maxTokens deve ser maior que 0');
  }

  if (LLMConfig.topP < 0 || LLMConfig.topP > 1) {
    throw new Error('[LLMConfig] topP deve estar entre 0 e 1');
  }

  if (LLMConfig.frequencyPenalty < 0 || LLMConfig.frequencyPenalty > 2) {
    throw new Error('[LLMConfig] frequencyPenalty deve estar entre 0 e 2');
  }

  if (LLMConfig.presencePenalty < 0 || LLMConfig.presencePenalty > 2) {
    throw new Error('[LLMConfig] presencePenalty deve estar entre 0 e 2');
  }
}
