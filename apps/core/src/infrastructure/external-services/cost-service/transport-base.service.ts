import { Coordinates } from '../../../domain/value-objects';
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
  protected calculateDistance(
    originCoordinates?: Coordinates,
    destinationCoordinates?: Coordinates,
    origin?: string,
    destination?: string
  ): number {
    if (originCoordinates && destinationCoordinates)
      return originCoordinates.distanceTo(destinationCoordinates);

    if (origin && destination)
      return this.getDistanceFromCommonRoutes(origin, destination);

    return 1000; //fallback
  }

  protected getDistanceFromCommonRoutes(
    origin: string,
    destination: string
  ): number {
    const commonRoutes: Record<string, number> = {
      'São Paulo-Rio de Janeiro': 360,
      'Rio de Janeiro-São Paulo': 360,
      'São Paulo-Brasília': 870,
      'Brasília-São Paulo': 870,
      'São Paulo-Salvador': 1450,
      'Salvador-São Paulo': 1450,
      'São Paulo-Fortaleza': 2370,
      'Fortaleza-São Paulo': 2370,
      'Rio de Janeiro-Salvador': 1214,
      'Salvador-Rio de Janeiro': 1214,
      'Rio de Janeiro-Brasília': 930,
      'Brasília-Rio de Janeiro': 930,
      'São Paulo-Belo Horizonte': 500,
      'Belo Horizonte-São Paulo': 500,
      'São Paulo-Curitiba': 330,
      'Curitiba-São Paulo': 330,
      'São Paulo-Porto Alegre': 860,
      'Porto Alegre-São Paulo': 860,
      'São Paulo-Florianópolis': 490,
      'Florianópolis-São Paulo': 490,
      'Rio de Janeiro-Belo Horizonte': 370,
      'Belo Horizonte-Rio de Janeiro': 370,
      'Juiz de Fora-São Paulo': 397,
      'São Paulo-Juiz de Fora': 397,
      'Juiz de Fora-Rio de Janeiro': 114,
      'Rio de Janeiro-Juiz de Fora': 114,
      'Juiz de Fora-Salvador': 1103,
      'Salvador-Juiz de Fora': 1103,
    };
    const routeKey = `${origin}-${destination}`;
    return commonRoutes[routeKey] || 1000;
  }
}
