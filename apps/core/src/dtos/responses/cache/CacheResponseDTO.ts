import { z } from 'zod';
import { HotelInfoSchema } from '../destination/costs';

const ForecastInfoDTOSchema = z.object({
  date: z.iso.datetime().optional(),
  temperature: z.number().optional(),
  temperatureMin: z.number().optional(),
  temperatureMax: z.number().optional(),
  condition: z.string().optional(),
  humidity: z.number().optional(),
  description: z.string().optional(),
  chanceOfRain: z.number().optional(),
});

const SeasonalInfoDTOSchema = z.object({
  season: z.enum(['summer', 'autumn', 'winter', 'spring']),
  averageTemperature: z.number(),
  averageRainfall: z.number(),
  description: z.string(),
});

const WeatherInfoDTOSchema = z.object({
  current: z
    .object({
      temperature: z.number().optional(),
      temperatureMin: z.number().optional(),
      temperatureMax: z.number().optional(),
      feelsLike: z.number().optional(),
      condition: z.string().optional(),
      humidity: z.number().optional(),
      description: z.string().optional(),
      generatedAt: z.iso.datetime().optional(),
      windSpeed: z.number().optional(),
      pressure: z.number().optional(),
      cloudiness: z.number().optional(),
      visibility: z.number().optional(),
    })
    .optional(),
  forecast: z.array(ForecastInfoDTOSchema).optional(),
  seasonal: SeasonalInfoDTOSchema.optional(),
});

const CostsTotalDTOSchema = z.object({
  transport: z
    .object({
      busMin: z.number().optional(),
      busMax: z.number().optional(),
      flightMin: z.number().optional(),
      flightMax: z.number().optional(),
    })
    .optional(),
  accommodation: z
    .object({
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      midRangeMin: z.number().optional(),
      midRangeMax: z.number().optional(),
      luxuryMin: z.number().optional(),
      luxuryMax: z.number().optional(),
    })
    .optional(),
  estimateDailyBudget: z
    .object({
      budget: z.number().optional(),
      midRange: z.number().optional(),
      luxury: z.number().optional(),
    })
    .optional(),
  totalEstimate: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  costsSources: z
    .object({
      transport: z.enum(['api', 'estimated']),
      accommodation: z.enum(['api', 'estimated']),
    })
    .optional(),
});

export const CachedResponseDTOSchema = z.object({
  cityId: z.uuidv4(),
  responseData: z.object({
    cityInfo: z.string(),
    weatherInfo: WeatherInfoDTOSchema.optional(),
    costsTotal: CostsTotalDTOSchema.optional(),
    generatedText: z.string().optional(),
    generatedAt: z.iso.datetime().optional(),
    hotels: z.array(HotelInfoSchema).optional(),
  }),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  hitCount: z.number(),
  isExpired: z.boolean(),
  remainingDays: z.number().optional(),
});

export type CachedResponseDTO = z.infer<typeof CachedResponseDTOSchema>;

export function mapCachedResponseToDTO(entity: {
  cityId: { toString(): string };
  responseData: {
    cityInfo: string;
    weatherInfo?: {
      current?: {
        temperature?: number;
        temperatureMin?: number;
        temperatureMax?: number;
        feelsLike?: number;
        condition?: string;
        humidity?: number;
        description?: string;
        generatedAt?: Date;
        windSpeed?: number;
        pressure?: number;
        cloudiness?: number;
        visibility?: number;
      };
      forecast?: Array<{
        date: Date;
        temperature?: number;
        temperatureMin?: number;
        temperatureMax?: number;
        condition?: string;
        humidity?: number;
        description?: string;
        chanceOfRain?: number;
      }>;
      seasonal?: {
        season: 'summer' | 'autumn' | 'winter' | 'spring';
        averageTemperature: number;
        averageRainfall: number;
        description: string;
      };
    };
    costsTotal?: {
      transport?: {
        busMin?: number;
        busMax?: number;
        flightMin?: number;
        flightMax?: number;
      };
      accommodation?: {
        budgetMin?: number;
        budgetMax?: number;
        midRangeMin?: number;
        midRangeMax?: number;
        luxuryMin?: number;
        luxuryMax?: number;
      };
      estimateDailyBudget?: {
        budget?: number;
        midRange?: number;
        luxury?: number;
      };
      totalEstimate?: {
        min?: number;
        max?: number;
      };
      costsSources?: {
        transport: 'api' | 'estimated';
        accommodation: 'api' | 'estimated';
      };
    };
    generatedText?: string;
    generatedAt?: Date;
    hotels?: Array<{
      hotelId: string;
      name: string;
      cityCode?: string;
      rating?: string;
      geoCode?: {
        latitude?: number;
        longitude?: number;
      };
    }>;
  };
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  isExpired(): boolean;
  getRemainingTTL(): number;
}): CachedResponseDTO {
  return {
    cityId: entity.cityId.toString(),
    responseData: {
      cityInfo: entity.responseData.cityInfo,
      weatherInfo: entity.responseData.weatherInfo
        ? {
            current: entity.responseData.weatherInfo.current
              ? {
                  ...entity.responseData.weatherInfo.current,
                  generatedAt:
                    entity.responseData.weatherInfo.current.generatedAt?.toISOString(),
                }
              : undefined,
            forecast: entity.responseData.weatherInfo.forecast?.map((f) => ({
              ...f,
              date: f.date.toISOString(),
            })),
            seasonal: entity.responseData.weatherInfo.seasonal,
          }
        : undefined,
      costsTotal: entity.responseData.costsTotal,
      generatedText: entity.responseData.generatedText,
      generatedAt: entity.responseData.generatedAt?.toISOString(), // ⬅️ Adicionado
      hotels: entity.responseData.hotels, // ⬅️ Adicionado
    },
    createdAt: entity.createdAt.toISOString(),
    expiresAt: entity.expiresAt.toISOString(),
    hitCount: entity.hitCount,
    isExpired: entity.isExpired(),
    remainingDays: entity.getRemainingTTL(),
  };
}
