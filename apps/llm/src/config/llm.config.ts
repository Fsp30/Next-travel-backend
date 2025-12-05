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
