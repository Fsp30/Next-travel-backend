import { Coordinates } from '../../../domain/value-objects';
import {
  WeatherForecastDTO,
  WeatherForecastSchema,
  mapForecastToDTO,
} from '../../../dtos';
import { WeatherBaseService } from './weather-base.service';

export interface ForecastInput {
  coordinates: Coordinates;
  days?: number;
}

export interface ForecastOutput {
  data: WeatherForecastDTO[];
}

interface ForecastAPIResponse {
  list?: Array<{
    dt?: number;
    main?: {
      temp?: number;
      temp_min?: number;
      temp_max?: number;
      humidity?: number;
    };
    weather?: Array<{
      main?: string;
      description?: string;
    }>;
    pop?: number;
  }>;
}

export class WeatherForecastService extends WeatherBaseService<
  ForecastInput,
  ForecastOutput
> {
  async execute(input: ForecastInput): Promise<ForecastOutput> {
    this.validateInput(input);

    const response = await this.fetchForecast(input.coordinates, input.days);
    const validatedData = this.validateResponse(response, input.days);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: ForecastInput): void {
    if (!input.coordinates) {
      throw new Error('As coordenadas são obrigatórias.');
    }

    const { latitude, longitude } = input.coordinates;

    if (latitude < -90 || latitude > 90) {
      throw new Error('A latitude deve estar entre -90 e 90.');
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('A longitude deve estar entre -180 e 180.');
    }

    if (input.days && (input.days < 1 || input.days > 16)) {
      throw new Error('O número de dias deve estar entre 1 e 16.');
    }
  }

  private async fetchForecast(
    coordinates: Coordinates,
    days?: number
  ): Promise<ForecastAPIResponse> {
    try {
      const cnt = days ? days * 8 : 40; // 8 previsões por dia (3h cada)

      const response = await this.http.get<ForecastAPIResponse>(
        '/forecast',
        this.withDefaultParams({
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          cnt,
        })
      );
      return response;
    } catch (error) {
      console.error(
        '[ForecastService] Erro ao buscar previsão do tempo:',
        error
      );
      throw new Error('Falha ao buscar previsão do tempo');
    }
  }

  private validateResponse(
    response: ForecastAPIResponse,
    days?: number
  ): WeatherForecastDTO[] {
    if (!response.list || response.list.length === 0) {
      throw new Error('Resposta da API não contém dados de previsão');
    }

    const forecastByDay = this.groupForecastByDay(response.list);

    const limitedForecast = days ? forecastByDay.slice(0, days) : forecastByDay;

    const validatedForecasts = limitedForecast.map((forecast, index) => {
      const validationResult = WeatherForecastSchema.safeParse(forecast);

      if (!validationResult.success) {
        console.error(
          `[ForecastService] Erro ao validar previsão ${index}:`,
          validationResult.error.issues
        );
        throw new Error(`Dados da previsão ${index} são inválidos`);
      }

      return validationResult.data;
    });

    return validatedForecasts;
  }

  private groupForecastByDay(
    list: ForecastAPIResponse['list']
  ): WeatherForecastDTO[] {
    if (!list) return [];

    const dailyForecasts = new Map<string, typeof list>();

    list.forEach((item) => {
      if (!item.dt) return;

      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];

      if (!dailyForecasts.has(dayKey)) {
        dailyForecasts.set(dayKey, []);
      }
      dailyForecasts.get(dayKey)!.push(item);
    });

    return Array.from(dailyForecasts.entries()).map(([dayKey, items]) => {
      const temps = items.map((i) => i.main?.temp ?? 0);
      const minTemps = items.map((i) => i.main?.temp_min ?? 0);
      const maxTemps = items.map((i) => i.main?.temp_max ?? 0);
      const humidities = items.map((i) => i.main?.humidity ?? 0);
      const pops = items.map((i) => i.pop ?? 0);

      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const minTemp = Math.min(...minTemps);
      const maxTemp = Math.max(...maxTemps);
      const avgHumidity =
        humidities.reduce((a, b) => a + b, 0) / humidities.length;
      const maxPop = Math.max(...pops);

      const conditions = items.map((i) => i.weather?.[0]?.main ?? 'Unknown');
      const mostCommonCondition = this.getMostCommon(conditions);
      const description =
        items.find((i) => i.weather?.[0]?.main === mostCommonCondition)
          ?.weather?.[0]?.description ?? '';

      return mapForecastToDTO({
        dt: new Date(dayKey).getTime() / 1000,
        main: {
          temp: avgTemp,
          temp_min: minTemp,
          temp_max: maxTemp,
          humidity: avgHumidity,
        },
        weather: [{ main: mostCommonCondition, description }],
        pop: maxPop,
      });
    });
  }

  private getMostCommon<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    arr.forEach((item) => {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = arr[0];

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }
}
