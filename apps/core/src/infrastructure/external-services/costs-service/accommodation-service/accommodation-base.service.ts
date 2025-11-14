import axios from 'axios';
import { BaseService } from '../../../shared';
import { AxiosClient } from '../../http/axios.client';

export abstract class AccomodationBaseService<
  I = void,
  O = void,
> extends BaseService<I, O> {
  protected readonly http: AxiosClient;
  protected readonly clientId: string;
  protected readonly clientSecret: string;
  protected accessToken: string | null = null;
  protected tokenExpiresAt: number = 0;

  constructor() {
    super();

    this.clientId = process.env.ACCOMMODATION_API_KEY || '';
    this.clientSecret = process.env.ACCOMMODATION_API_SECRET_KEY || '';

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Variaveis ambientes de apis de acomodação não configuradas'
      );
    }

    this.http = new AxiosClient('https://test.api.amadeus.com');
  }

  protected async getToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const { data } = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.accessToken = data.access_token;
    this.tokenExpiresAt = now + data.expires_in * 1000;

    if (!this.accessToken) {
      throw new Error('Falha ao se autenticar com AMADEUS API');
    }
    return this.accessToken;
  }
  protected async withDefaultHeaders(headers: Record<string, unknown> = {}) {
    const token = await this.getToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
}
