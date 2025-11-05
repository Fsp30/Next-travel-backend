import { z } from 'zod';

export const GetCityDTOSchema = z
  .object({
    cityId: z.uuidv4('ID inválido').optional(),
    slug: z.string().min(1).optional(),
  })
  .refine((data) => data.cityId || data.slug, {
    message: 'CityId ou Slug deve ser fornecido',
    path: ['cityId'],
  });

export type GetCityDTO = z.infer<typeof GetCityDTOSchema>;

export function validateGetCityDTO(data: unknown): GetCityDTO {
  return GetCityDTOSchema.parse(data);
}
