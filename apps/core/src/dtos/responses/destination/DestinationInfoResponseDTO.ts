import z from 'zod';
import { CityResponseDTOSchema } from './CityResponseDTO';
import { WeatherInfoDTOSchema } from './WeatherInfoDTO';
import { CostEstimateDTOSchema } from './CostEstimateDTO';

export const DestinationInfoResponseDTOSchema = z.object({
  city: CityResponseDTOSchema,

  cityInfo: z.object({
    description: z.string(),
    summary: z.string().optional(),
    pageUrl: z.url().optional(),
  }),

  weather: WeatherInfoDTOSchema.optional(),

  costs: CostEstimateDTOSchema.optional(),

  travelInfo: z
    .object({
      startDate: z.iso.datetime().optional(),
      endDate: z.iso.datetime().optional(),
      duration: z.number().int().optional(),
    })
    .optional(),

  recommendations: z.array(z.string()).optional(),

  cachedAt: z.iso.datetime().optional(),

  sources: z
    .array(
      z.object({
        name: z.string(),
        url: z.url().optional(),
      })
    )
    .optional(),
});

export type DestinationInfoResponseDTO = z.infer<
  typeof DestinationInfoResponseDTOSchema
>;
