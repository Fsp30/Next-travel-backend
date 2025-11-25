import { BaseService } from '../../shared';
import { AxiosClient } from '../http/axios.client';

export abstract class WeatherBaseService<
  I = void,
  O = void,
> extends BaseService<I, O> {
  protected readonly http: AxiosClient;
  protected readonly key: string;

  constructor() {
    super();

    this.key = process.env.WEATHER_SECRET_KEY || '';
    if (!this.key) {
      throw new Error(
        'A variável de ambiente WEATHER_SECRET_KEY não está configurada'
      );
    }

    this.http = new AxiosClient('https://api.openweathermap.org/data/2.5');
  }

  protected withDefaultParams(
    params: Record<string, unknown> = {}
  ): Record<string, unknown> {
    return {
      ...params,
      appid: this.key,
      units: 'metric',
      lang: 'pt_br',
    };
  }
}
