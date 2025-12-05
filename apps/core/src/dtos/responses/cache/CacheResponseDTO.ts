import { z } from 'zod';

const WeatherInfoDTOSchema = z.object({
  temperature: z.number().optional(),
  condition: z.string().optional(),
  humidity: z.number().optional(),
  description: z.string().optional(),
});

const TransportCostsDTOSchema = z.object({
  busMin: z.number().optional(),
  busMax: z.number().optional(),
  flightMin: z.number().optional(),
  flightMax: z.number().optional(),
});

export const AccommodationCostsDTOSchema = z.object({
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  midRangeMin: z.number().optional(),
  midRangeMax: z.number().optional(),
  luxuryMin: z.number().optional(),
  luxuryMax: z.number().optional(),
});

export const CachedResponseDTOSchema = z.object({
  cityId: z.uuidv4(),
  responseData: z.object({
    cityInfo: z.string(),
    weatherInfo: WeatherInfoDTOSchema.optional(),
    transportCosts: TransportCostsDTOSchema.optional(),
    accommodationCosts: AccommodationCostsDTOSchema.optional(),
    generatedText: z.string().optional(),
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
      temperature?: number;
      condition?: string;
      humidity?: number;
      description?: string;
    };
    transportCosts?: {
      busMin?: number;
      busMax?: number;
      flightMin?: number;
      flightMax?: number;
    };
    accommodationCosts?: {
      budgetMin?: number;
      budgetMax?: number;
      midRangeMin?: number;
      midRangeMax?: number;
      luxuryMin?: number;
      luxuryMax?: number;
    };
    generatedText?: string;
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
            temperature: entity.responseData.weatherInfo.temperature,
            condition: entity.responseData.weatherInfo.condition,
            humidity: entity.responseData.weatherInfo.humidity,
            description: entity.responseData.weatherInfo.description,
          }
        : undefined,
      transportCosts: entity.responseData.transportCosts
        ? {
            busMin: entity.responseData.transportCosts.busMin,
            busMax: entity.responseData.transportCosts.busMax,
            flightMin: entity.responseData.transportCosts.flightMin,
            flightMax: entity.responseData.transportCosts.flightMax,
          }
        : undefined,
      accommodationCosts: entity.responseData.accommodationCosts
        ? {
            budgetMin: entity.responseData.accommodationCosts.budgetMin,
            budgetMax: entity.responseData.accommodationCosts.budgetMax,
            midRangeMin: entity.responseData.accommodationCosts.midRangeMin,
            midRangeMax: entity.responseData.accommodationCosts.midRangeMax,
            luxuryMin: entity.responseData.accommodationCosts.luxuryMin,
            luxuryMax: entity.responseData.accommodationCosts.luxuryMax,
          }
        : undefined,
      generatedText: entity.responseData.generatedText,
    },
    createdAt: entity.createdAt.toISOString(),
    expiresAt: entity.expiresAt.toISOString(),
    hitCount: entity.hitCount,
    isExpired: entity.isExpired(),
    remainingDays: entity.getRemainingTTL(),
  };
}
