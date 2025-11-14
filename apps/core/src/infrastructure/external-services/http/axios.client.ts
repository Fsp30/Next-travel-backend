import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export class AxiosClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next-Travel/0.1',
      },
    });
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: (retryCount) => {
        return Math.pow(2, retryCount) * 1000;
      },
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkError(error) ||
          axiosRetry.isRetryableError(error) ||
          error.response?.status === 429 ||
          (error.response?.status ?? 0) >= 500
        );
      },
    });
  }

  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.client.get<T>(url, {
      params,
      headers,
    });
    return response.data;
  }
}
