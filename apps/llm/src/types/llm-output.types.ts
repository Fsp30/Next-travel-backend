export interface GenerateTravelGuideOutput {
  text: string;
  metadata: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    generatedAt: Date;
    responseTime: number;
  };
}

export interface LLMError {
  type: 'api_error' | 'rate_limit' | 'timeout' | 'invalid_request' | 'unknown';
  message: string;
  statusCode?: number;
  originalError?: unknown;
}
