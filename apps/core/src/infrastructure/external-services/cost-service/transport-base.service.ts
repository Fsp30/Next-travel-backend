import { BaseService } from '../../shared';
import { AxiosClient } from '../http/axios.client';

export abstract class TransportBaseService<
  I = void,
  O = void,
> extends BaseService<I, O> {
  protected readonly http: AxiosClient;
  protected readonly key: string;

  constructor() {
    super();
    this.key = process.env.AVIATION_TRANSPORT_SECRET_KEY || '';
    if (!this.key) {
      throw new Error(
        'A variavel ambiente AVIATION_TRANSPORT_SECRET_KEY não está configurada'
      );
    }

    this.http = new AxiosClient('https://api.aviationstack.com/v1/flights');
  }
  protected withDefaultParams(
    params: Record<string, unknown> = {}
  ): Record<string, unknown> {
    return {
      ...params,
      access_key: this.key,
    };
  }
}
