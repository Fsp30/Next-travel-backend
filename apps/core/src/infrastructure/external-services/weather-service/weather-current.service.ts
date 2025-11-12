import { Coordinates } from '../../../domain/value-objects';
import {
  mapCurrentWeatherToDTO,
  WeatherCurrentDataDTO,
  WeatherDataSchema,
} from '../../../dtos';
import { WeatherBaseService } from './weather-base.service';

export interface WeatherCurrentInput {
  coordinates: Coordinates;
}

export interface WeatherCurrentOutput {
  data: WeatherCurrentDataDTO;
}

export interface WeatherCurrentApiResponse {
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wather?: Array<{
    main?: string;
    description?: string;
  }>;
  wind?: {
    speed?: number;
  };
  clouds?: {
    all?: number;
  };
  visibility?: number;
  dt?: number;
}

export class WeatherCurrentService extends WeatherBaseService<
  WeatherCurrentInput,
  WeatherCurrentOutput
> {
  async execute(input: WeatherCurrentInput): Promise<WeatherCurrentOutput> {
    this.validateInput(input);

    const response = await this.fetchCurrentWeather(input.coordinates);
    const validatedData = this.validateResponse(response);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: WeatherCurrentInput) {
    if (!input.coordinates) {
      throw new Error('O valor das coordenadas deve ser informado');
    }

    const { latitude, longitude } = input.coordinates;

    if (latitude < -90 || latitude > 90) {
      throw new Error('O valor de latitude devem estar entre -90 e 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('O valor de longitude devem estar entre -180 e 180');
    }
  }

  private async fetchCurrentWeather(
    coordinates: Coordinates
  ): Promise<WeatherCurrentApiResponse> {
    try {
      const response = await this.http.get<WeatherCurrentApiResponse>(
        '/weather',
        this.withDefaultParams({
          lat: coordinates.latitude,
          lon: coordinates.longitude,
        })
      );
      return response;
    } catch (error) {
      console.error(
        '[WeatherCurrentService] Erro ao buscar clima atual:',
        error
      );
      throw new Error('Falha ao buscar dados do clima atual');
    }
  }
  private validateResponse(
    response: WeatherCurrentApiResponse
  ): WeatherCurrentDataDTO {
    const mappedData = mapCurrentWeatherToDTO(response);
    const validationResult = WeatherDataSchema.safeParse(mappedData);

    if (!validationResult.success) {
      console.error(
        '[CurrentWeatherService] Erro ao validar schema:',
        validationResult.error.issues
      );
      throw new Error('Dados do clima atual são inválidos');
    }

    return validationResult.data;
  }
}
