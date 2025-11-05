import { z } from 'zod';

export const CreateCityDTOSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  state: z.string().min(2, 'Estado deve ter no mínimo 2 caracteres').max(100),
  country: z.string().min(2).max(100).default('Brasil'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type CreateCityDTO = z.infer<typeof CreateCityDTOSchema>;

export function validateCreateCityDTO(data: unknown): CreateCityDTO {
  return CreateCityDTOSchema.parse(data);
}
