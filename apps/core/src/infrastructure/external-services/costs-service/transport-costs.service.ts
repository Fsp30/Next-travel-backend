import { Coordinates } from '../../../domain/value-objects';
import { TransportCostsDTO, TransportCostsDTOSchema } from '../../../dtos';
import { TransportBaseService } from './transport-base.service';

export interface TransportCostsInput {
  origin: string;
  destination: string;
  originCoordinates?: Coordinates;
  destinationCoordinates?: Coordinates;
  date?: Date;
}

export interface TransportCostsOutput {
  data: TransportCostsDTO;
  source: 'api' | 'estimated';
}

interface AviationstackResponse {
  data?: Array<{
    flight_date?: string;
    departure?: {
      iata?: string;
      airport?: string;
    };
    arrival?: {
      iata?: string;
      airport?: string;
    };
    airline?: {
      name?: string;
    };
    flight?: {
      number?: string;
    };
  }>;
}

export class TransportCostsService extends TransportBaseService<
  TransportCostsInput,
  TransportCostsOutput
> {
  private readonly flightPrices = {
    short: { min: 260, max: 538 },
    mid: { min: 510, max: 919 },
    long: { min: 900, max: 1413 },
    veryLong: { min: 1200, max: 2700 },
  };

  private readonly busPrices = {
    short: { min: 40, max: 175 },
    mid: { min: 100, max: 300 },
    long: { min: 190, max: 600 },
    veryLong: { min: 350, max: 1000 },
  };

  async execute(input: TransportCostsInput): Promise<TransportCostsOutput> {
    this.validateInput(input);

    try {
      const apiData = await this.fetchFromAPI(input);
      if (apiData) return apiData;
    } catch (error) {
      console.warn(
        '[TransportCostsService] Falha na API, usando estimativa:',
        error
      );
    }

    return this.calculateEstimate(input);
  }

  private validateInput(input: TransportCostsInput): void {
    if (!input.origin?.trim()) {
      throw new Error('A origem é obrigatória.');
    }
    if (!input.destination?.trim()) {
      throw new Error('O destino é obrigatório.');
    }
  }

  private async fetchFromAPI(
    input: TransportCostsInput
  ): Promise<TransportCostsOutput | null> {
    const depIata = this.getCityIataCode(input.origin);
    const arrIata = this.getCityIataCode(input.destination);

    if (!depIata || !arrIata) return null;

    try {
      const response = await this.http.get<AviationstackResponse>(
        '',
        this.withDefaultParams({
          dep_iata: depIata,
          arr_iata: arrIata,
          limit: 10,
        })
      );

      if (response?.data && response.data.length > 0) {
        console.log(
          '[TransportCostsService] Dados reais recebidos:',
          response.data
        );
      }

      return null;
    } catch (error) {
      console.error('[TransportCostsService] Erro ao buscar da API:', error);
      return null;
    }
  }

  private getCityIataCode(cityName: string): string | null {
    const iataMap: Record<string, string> = {
      'São Paulo': 'GRU',
      'Rio de Janeiro': 'GIG',
      Brasília: 'BSB',
      Salvador: 'SSA',
      Fortaleza: 'FOR',
      'Belo Horizonte': 'CNF',
      Curitiba: 'CWB',
      Recife: 'REC',
      'Porto Alegre': 'POA',
      Florianópolis: 'FLN',
    };

    return iataMap[cityName] || null;
  }

  private calculateEstimate(input: TransportCostsInput): TransportCostsOutput {
    const distance = this.calculateDistance(
      input.originCoordinates,
      input.destinationCoordinates,
      input.origin,
      input.destination
    );

    const flightCosts = this.calculateFlightCosts(distance);
    const busCosts = this.calculateBusCosts(distance);

    const transportCosts: TransportCostsDTO = {
      flight: flightCosts,
      bus: busCosts,
      currency: 'BRL',
    };

    const validation = TransportCostsDTOSchema.safeParse(transportCosts);
    if (!validation.success) {
      console.error(
        '[TransportCostsService] Schema inválido:',
        validation.error.issues
      );
      throw new Error('Dados de custos de transporte inválidos.');
    }

    return {
      data: validation.data,
      source: 'estimated',
    };
  }

  private calculateFlightCosts(distance: number) {
    const range = this.getPriceRangeForDistance(distance, this.flightPrices);
    return { min: range.min, max: range.max };
  }

  private calculateBusCosts(distance: number) {
    const range = this.getPriceRangeForDistance(distance, this.busPrices);
    return { min: range.min, max: range.max };
  }

  private getPriceRangeForDistance(
    distance: number,
    priceTable: typeof this.flightPrices
  ) {
    if (distance < 500) return priceTable.short;
    if (distance < 1500) return priceTable.mid;
    if (distance < 3000) return priceTable.long;
    return priceTable.veryLong;
  }
}
