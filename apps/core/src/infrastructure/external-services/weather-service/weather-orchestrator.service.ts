import { Coordinates } from '../../../domain/value-objects';
import {
  SeasonalWeatherDTO,
  WeatherCurrentDataDTO,
  WeatherForecastDTO,
} from '../../../dtos';
import {
  WeatherCurrentInput,
  WeatherCurrentOutput,
  WeatherCurrentService,
} from './weather-current.service';
import {
  ForecastInput,
  ForecastOutput,
  WeatherForecastService,
} from './weather-forecast.service';
import {
  WeatherSeasonalInput,
  WeatherSeasonalOutput,
  WeatherSeasonalService,
} from './weather-seasonal.service';
import { BaseService } from '../../shared';

export interface WeatherOrchestratorInput {
  coordinates?: Coordinates;
  cityName?: string;
  forecastDays?: number;
  targetMonth?: number;
  includeForecast: boolean;
  includeSeasonal: boolean;
}

export interface WeatherOrchestratorOutput {
  current: WeatherCurrentDataDTO | null;
  forecast?: WeatherForecastDTO[] | null;
  seasonal?: SeasonalWeatherDTO | null;
  location: {
    city?: string;
    coordinates?: Coordinates;
  };
}

export class WeatherOrchestratorService extends BaseService<
  WeatherOrchestratorInput,
  WeatherOrchestratorOutput
> {
  constructor(
    private readonly currentService: WeatherCurrentService,
    private readonly forecastService: WeatherForecastService,
    private readonly seasonalService: WeatherSeasonalService
  ) {
    super();
  }

  async execute(
    input: WeatherOrchestratorInput
  ): Promise<WeatherOrchestratorOutput> {
    this.validateInput(input);

    const coordinates = await this.resolveCoordinates(input);
    if (!coordinates) {
      throw new Error(
        'Não foi possivél determinar as coordenadas da localização.'
      );
    }

    const [current, forecast, seasonal] = await Promise.allSettled([
      this.fetchCurrentWeather(coordinates),
      input.includeForecast
        ? this.fetchForecastWeather(coordinates, input.forecastDays)
        : null,
      input.includeSeasonal
        ? this.fetchSeasonWeather(coordinates, input.targetMonth)
        : null,
    ]);

    return {
      current: this.extractResult(current),
      forecast: this.extractResult(forecast),
      seasonal: this.extractResult(seasonal),
      location: {
        city: input.cityName,
        coordinates,
      },
    };
  }

  private validateInput(input: WeatherOrchestratorInput): void {
    if (!input.coordinates && !input.cityName) {
      throw new Error('Nome da cidade ou Coordenadas obrigatórias.');
    }
    if (input.cityName && input.cityName.trim().length <= 2) {
      throw new Error('O nome da cidade não pode ser menor que 2 caracteres.');
    }
    if (
      input.targetMonth &&
      (input.targetMonth < 1 || input.targetMonth > 12)
    ) {
      throw new Error('O númerico do mês deve estra entre 1 e 12.');
    }
    if (
      input.forecastDays &&
      (input.forecastDays < 1 || input.forecastDays > 16)
    ) {
      throw new Error('O número de dias de previsão deve estar entre 1 e 16.');
    }
  }

  private async resolveCoordinates(
    input: WeatherOrchestratorInput
  ): Promise<Coordinates | null> {
    if (input.coordinates) {
      return input.coordinates;
    }

    if (input.cityName) {
      return this.getCityCoordinates(input.cityName);
    }

    return null;
  }

  private getCityCoordinates(cityName: string): Coordinates | null {
    const cityCoordinates: Record<
      string,
      { latitude: number; longitude: number }
    > = {
      'São Paulo': { latitude: -23.5505, longitude: -46.6333 },
      'Rio de Janeiro': { latitude: -22.9068, longitude: -43.1729 },
      Brasília: { latitude: -15.7939, longitude: -47.8828 },
      Salvador: { latitude: -12.9714, longitude: -38.5014 },
      Fortaleza: { latitude: -3.7172, longitude: -38.5433 },
      'Belo Horizonte': { latitude: -19.9167, longitude: -43.9345 },
      Curitiba: { latitude: -25.4284, longitude: -49.2733 },
      Recife: { latitude: -8.0476, longitude: -34.877 },
      'Porto Alegre': { latitude: -30.0346, longitude: -51.2177 },
      Florianópolis: { latitude: -27.5954, longitude: -48.548 },
      Manaus: { latitude: -3.119, longitude: -60.0217 },
      Belém: { latitude: -1.4558, longitude: -48.5039 },
    };

    const coords = cityCoordinates[cityName];
    return coords
      ? Coordinates.create(coords.latitude, coords.longitude)
      : null;
  }

  private async fetchCurrentWeather(
    coordinates: Coordinates
  ): Promise<WeatherCurrentDataDTO | null> {
    try {
      const currentInput: WeatherCurrentInput = { coordinates };
      const result: WeatherCurrentOutput =
        await this.currentService.execute(currentInput);
      return result.data;
    } catch (error) {
      console.error(
        '[WeatherOrchestrator] Erro ao buscar clima atual: ',
        error
      );
      return null;
    }
  }
  private async fetchForecastWeather(
    coordinates: Coordinates,
    days?: number
  ): Promise<WeatherForecastDTO[] | null> {
    try {
      const forecastInput: ForecastInput = {
        coordinates,
        days: days || 5,
      };
      const result: ForecastOutput =
        await this.forecastService.execute(forecastInput);
      return result.data;
    } catch (error) {
      console.error(
        '[WeatherOrchestrator] Erro ao buscar previsão do tempo: ',
        error
      );
      return null;
    }
  }
  private async fetchSeasonWeather(
    coordinates: Coordinates,
    month?: number
  ): Promise<SeasonalWeatherDTO | null> {
    try {
      const seasonalInput: WeatherSeasonalInput = {
        coordinates,
        month: month || new Date().getMonth() + 1,
      };
      const result: WeatherSeasonalOutput =
        await this.seasonalService.execute(seasonalInput);
      return result.data;
    } catch (error) {
      console.error(
        '[WeatherOrchestrator] Erro ao buscar clima sazonal: ',
        error
      );
      return null;
    }
  }
  private extractResult<T>(result: PromiseSettledResult<T | null>): T | null {
    if (result.status === 'fulfilled') {
      return result.value ?? null;
    }
    return null;
  }
}
