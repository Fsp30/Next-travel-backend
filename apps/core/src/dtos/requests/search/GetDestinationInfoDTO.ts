import z from 'zod';

export const GetDestinationInfoDTOSchema = z
  .object({
    cityId: z.uuidv4('cityId Inválido').optional(),

    citySlug: z.string().min(1).optional,
  })
  .refine((data) => data.cityId || data.citySlug, {
    message: 'Ao menos um das cidades deve ser fornecida',
    path: ['cityId'],
  });

export type GetDestinationInfoDTO = z.infer<typeof GetDestinationInfoDTOSchema>;

export function validateGetDestinationInfoDTO(
  data: unknown
): GetDestinationInfoDTO {
  return GetDestinationInfoDTOSchema.parse(data);
}
