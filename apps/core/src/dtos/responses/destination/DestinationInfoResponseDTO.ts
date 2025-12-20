import { z } from 'zod';
import { CityResponseDTOSchema } from './CityResponseDTO';
import { WeatherInfoDTOSchema } from '../external-services/weather/WeatherInfoDTO';
import { HotelInfoSchema, CostEstimateDTOSchema } from './costs';

export const DestinationInfoResponseDTOSchema = z.object({
  city: CityResponseDTOSchema,

  cityInfo: z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    summary: z.string().optional(),
    pageUrl: z.url('URL da página inválida').optional(),
    thumbnailUrl: z.url('URL da thumbnail inválida').optional(),
    extractedAt: z.date().optional(),
  }),

  textGenerated: z.string().min(1),

  weather: WeatherInfoDTOSchema.optional(),

  costs: CostEstimateDTOSchema.optional(),

  hotels: z.array(HotelInfoSchema).optional().default([]),

  travelInfo: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      durationDays: z
        .number()
        .int()
        .positive('Duração deve ser positiva')
        .optional(),
    })
    .optional(),

  recommendations: z
    .object({
      text: z.string(),
      highlights: z.array(z.string()).optional(),
      tips: z.array(z.string()).optional(),
      generatedAt: z.date().optional(),
    })
    .optional(),

  cache: z
    .object({
      cached: z.boolean(),
      cachedAt: z.date().optional(),
      expiresAt: z.date().optional(),
      source: z.enum(['redis', 'fresh']).optional(),
    })
    .optional(),

  sources: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['api', 'database', 'cache']).optional(),
        url: z.url().optional(),
        accessedAt: z.date().optional(),
      })
    )
    .optional(),

  metadata: z
    .object({
      generatedAt: z.date(),
      processingTimeMs: z.number().optional(),
      apiCallsCount: z.number().int().optional(),
    })
    .optional(),
});

export type DestinationInfoResponseDTO = z.infer<
  typeof DestinationInfoResponseDTOSchema
>;

export function validateDestinationInfoResponseDTO(
  data: unknown
): DestinationInfoResponseDTO {
  return DestinationInfoResponseDTOSchema.parse(data);
}

export function safeValidateDestinationInfoResponseDTO(data: unknown) {
  return DestinationInfoResponseDTOSchema.safeParse(data);
}

export function createPartialDestinationInfo(
  city: z.infer<typeof CityResponseDTOSchema>,
  cityInfo: { description: string; summary?: string; pageUrl?: string }
): Partial<DestinationInfoResponseDTO> {
  return {
    city,
    cityInfo,
    metadata: {
      generatedAt: new Date(),
    },
  };
}
