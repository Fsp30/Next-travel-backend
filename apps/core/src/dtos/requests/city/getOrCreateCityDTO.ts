import { z } from 'zod';

export const GetOrCreateCityDTOSchema = z
  .object({
    slug: z.string().min(1).optional(),

    name: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    country: z.string().min(2).max(100).default('Brasil'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => data.slug || (data.name && data.state), {
    message: 'Slug ou nome + estado devem ser fornecidos',
    path: ['slug'],
  });

export type GetOrCreateCityDTO = z.infer<typeof GetOrCreateCityDTOSchema>;

export function validateGetOrCreateCityDTO(data: unknown): GetOrCreateCityDTO {
  return GetOrCreateCityDTOSchema.parse(data);
}
