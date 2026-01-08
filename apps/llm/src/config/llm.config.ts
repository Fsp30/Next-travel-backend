import dotenv from 'dotenv';

dotenv.config();

export const LLMConfig = {
  provider: process.env.LLM_PROVIDER || 'groq',
  model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
  apiKey: process.env.LLM_API_KEY || '',
  timeout: parseFloat(process.env.LLM_TIMEOUT || '3000'),

  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
  },

  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.9'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '1000', 10),
  topP: parseFloat(process.env.LLM_TOP_P || '1'),
  defaultLanguage: 'pt-BR',
};

export const ModelCosts = {
  'llama-3.1-8b-instant': { input: 0, output: 0 },
  'mixtral-8x7b-32768': { input: 0, output: 0 },
  'gemma2-9b-it': { input: 0, output: 0 },
};
