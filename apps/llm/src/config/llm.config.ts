export const LLMConfig = {
  model: process.env.LLM_MODEL || 'gemini-1.5-flash',
  apiKey: process.env.LLM_API_KEY || '',
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.9'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1000', 10),
  topP: parseFloat(process.env.LLM_TOP_P || '1'),
  timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
  retries: parseInt(process.env.LLM_RETRIES || '2', 10),
  retryDelay: parseInt(process.env.LLM_RETRY_DELAY || '1000', 10),
  defaultLanguage: 'pt-BR',
};

export type LLMConfigType = typeof LLMConfig;

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
}

export const PromptConfigs = {
  travelGuide: {
    temperature: 0.9,
    maxTokens: 1000,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  },

  shortSummary: {
    temperature: 0.4,
    maxTokens: 300,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
  },

  detailedGuide: {
    temperature: 0.8,
    maxTokens: 2000,
    frequencyPenalty: 0.6,
    presencePenalty: 0.6,
  },
} as const;

export const ModelCosts = {
  'gemini-1.5-flash': {
    input: 0.000075,
    output: 0.0003,
  },
};
