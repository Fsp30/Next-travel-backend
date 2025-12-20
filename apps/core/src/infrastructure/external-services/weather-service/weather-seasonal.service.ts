import { Coordinates } from '../../../domain/value-objects';
import { SeasonalWeatherDTO, SeasonalWeatherSchema } from '../../../dtos';
import { WeatherBaseService } from './weather-base.service';

export interface WeatherSeasonalInput {
  coordinates: Coordinates;
  month: number;
}
export interface WeatherSeasonalOutput {
  data: SeasonalWeatherDTO;
}

export class WeatherSeasonalService extends WeatherBaseService<
  WeatherSeasonalInput,
  WeatherSeasonalOutput
> {
  private readonly seasonalData = {
    summer: {
      months: [12, 1, 2],
      avgTemp: 28,
      avgRainfall: 180,
      description: 'Verão quente e úmido com chuvas frequentes',
    },
    autumn: {
      months: [3, 4, 5],
      avgTemp: 23,
      avgRainfall: 100,
      description: 'Outono com temperaturas amenas e chuvas moderadas',
    },
    winter: {
      months: [6, 7, 8],
      avgTemp: 18,
      avgRainfall: 50,
      description: 'Inverno seco com temperaturas mais baixas',
    },
    spring: {
      months: [9, 10, 11],
      avgTemp: 24,
      avgRainfall: 120,
      description: 'Primavera com temperaturas crescentes e chuvas ocasionais',
    },
  };

  async execute(input: WeatherSeasonalInput): Promise<WeatherSeasonalOutput> {
    this.validateInput(input);

    const season = this.getSeasonForMonth(input.month, input.coordinates);
    const seasonalWeather = this.buildSeasonalWeather(
      season,
      input.coordinates
    );
    const validatedData = this.validateResponse(seasonalWeather);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: WeatherSeasonalInput): void {
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

    if (input.month < 1 || input.month > 12) {
      throw new Error('O valor númerico do mês deve estar entre 1 e 12');
    }
  }

  private getSeasonForMonth(
    month: number,
    coordinates: Coordinates
  ): 'summer' | 'autumn' | 'winter' | 'spring' {
    const isNorthernHemisphere = coordinates.latitude >= 0;

    type Season = 'summer' | 'autumn' | 'winter' | 'spring';

    const isValidSeason = (key: string): key is Season => {
      return ['summer', 'autumn', 'winter', 'spring'].includes(key);
    };

    for (const [season, data] of Object.entries(this.seasonalData)) {
      if (isValidSeason(season) && data.months.includes(month)) {
        if (isNorthernHemisphere) return this.invertSeason(season);

        return season;
      }
    }

    return 'spring';
  }

  private invertSeason(
    season: 'summer' | 'autumn' | 'winter' | 'spring'
  ): 'summer' | 'autumn' | 'winter' | 'spring' {
    const inversionMap = {
      summer: 'winter' as const,
      winter: 'summer' as const,
      autumn: 'spring' as const,
      spring: 'autumn' as const,
    };
    return inversionMap[season];
  }

  private buildSeasonalWeather(
    season: 'summer' | 'autumn' | 'winter' | 'spring',
    coordinates: Coordinates
  ): SeasonalWeatherDTO {
    const data = this.seasonalData[season];

    const latitudeAdjustment = Math.abs(coordinates.latitude) / 90;
    const tempAdjustment =
      coordinates.latitude >= 0
        ? 5 * latitudeAdjustment
        : -3 * latitudeAdjustment;

    return {
      season,
      averageTemperature: data.avgTemp + tempAdjustment,
      averageRainfall: data.avgRainfall,
      description: data.description,
    };
  }

  private validateResponse(data: SeasonalWeatherDTO): SeasonalWeatherDTO {
    const validationResult = SeasonalWeatherSchema.safeParse(data);

    if (!validationResult.success) {
      console.error(
        '[WeatherSeasonalService] Erro ao validar schema:',
        validationResult.error.issues
      );
      throw new Error('Dados do clima sazonal são inválidos');
    }
    return validationResult.data;
  }
}
