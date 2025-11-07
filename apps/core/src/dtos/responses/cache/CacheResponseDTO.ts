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
    responseData: entity.responseData,
    createdAt: entity.createdAt.toISOString(),
    expiresAt: entity.expiresAt.toISOString(),
    hitCount: entity.hitCount,
    isExpired: entity.isExpired(),
    remainingDays: entity.getRemainingTTL(),
  };
}
