import { z, ipv4, ipv6 } from 'zod';

export const GetDestinationInfoDTOSchema = z
  .object({
    citySlug: z.string().min(1, 'Slug da cidade é obrigatório'),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    ipAddress: z.union([ipv4(), ipv6()]).optional(),
    userAgent: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && !data.startDate) {
        return false;
      }
      if (data.startDate && data.startDate < new Date()) {
        return false;
      }
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Range de datas inválido',
      path: ['startDate'],
    }
  );

export type GetDestinationInfoDTO = z.infer<typeof GetDestinationInfoDTOSchema>;

export function validateGetDestinationInfoDTO(
  data: unknown
): GetDestinationInfoDTO {
  return GetDestinationInfoDTOSchema.parse(data);
}
