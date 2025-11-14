import axios from 'axios';
import { BaseService } from '../../../shared';
import { AxiosClient } from '../../http/axios.client';

export abstract class AccommodationBaseService<
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
      console.warn(
        '[AccommodationBaseService] Variaveis ambientes de apis de acomodação não configuradas - mode estimated'
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
    this.tokenExpiresAt = now + (data.expires_in - 60) * 1000;

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

  protected hasValidCredentials(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  protected mapCityToIataCode(city: string): string | null {
    const cityMap: Record<string, string> = {
      'São Paulo': 'SAO',
      'Rio de Janeiro': 'RIO',
      Brasília: 'BSB',
      Salvador: 'SSA',
      Fortaleza: 'FOR',
      Recife: 'REC',
      Curitiba: 'CWB',
      'Porto Alegre': 'POA',
      Florianópolis: 'FLN',
      Manaus: 'MAO',
      Belém: 'BEL',
      'Belo Horizonte': 'BHZ',
    };
    return cityMap[city] || null;
  }

  protected calculeteNights(chekIn: Date, checkout: Date): number {
    const diffTime = Math.abs(checkout.getTime() - chekIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
