import { ipv4, ipv6, z } from 'zod';

const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const GetDestinationInfoDTOSchema = z
  .object({
    cityName: z
      .string()
      .min(2, 'Nome da cidade deve ter pelo menos 2 caracteres')
      .max(100, 'Nome da cidade muito longo')
      .trim(),

    state: z
      .string()
      .min(3, 'Nome do estado deve ter pelo menos 3 caracteres')
      .max(50, 'Nome do estado muito longo')
      .trim(),

    country: z
      .string()
      .min(3, 'Nome do país deve ter pelo menos 3 caracteres')
      .max(50, 'Nome do país muito longo')
      .trim()
      .default('Brasil'),

    origin: z
      .string()
      .min(2, 'Nome da origem deve ter pelo menos 2 caracteres')
      .max(100, 'Nome da origem muito longo')
      .trim(),

    originCoordinates: CoordinatesSchema.optional(),

    userId: z.uuid('ID do usuário deve ser um UUID válido').optional(),

    startDate: z.coerce
      .date({
        error: () => ({ message: 'Data de início inválida' }),
      })
      .optional(),

    endDate: z.coerce
      .date({
        error: () => ({ message: 'Data de término inválida' }),
      })
      .optional(),

    ipAddress: z.union([ipv4(), ipv6()]).optional(),

    userAgent: z.string().max(500, 'User agent muito longo').optional(),

    incluedSummary: z.boolean().optional(),
    incluedSearch: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && !data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Data de término fornecida sem data de início',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (data.startDate < today) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Data de início não pode ser no passado',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Data de término deve ser posterior à data de início',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const maxDuration = 365 * 24 * 60 * 60 * 1000;
        const duration = data.endDate.getTime() - data.startDate.getTime();
        if (duration > maxDuration) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Duração da viagem não pode exceder 1 ano',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.originCoordinates && !data.origin) {
        return false;
      }
      return true;
    },
    {
      message: 'Coordenadas da origem fornecidas sem o nome da origem',
      path: ['origin'],
    }
  );

export type GetDestinationInfoDTO = z.infer<typeof GetDestinationInfoDTOSchema>;

export function validateGetDestinationInfoDTO(
  data: unknown
): GetDestinationInfoDTO {
  return GetDestinationInfoDTOSchema.parse(data);
}

export function safeValidateGetDestinationInfoDTO(data: unknown) {
  return GetDestinationInfoDTOSchema.safeParse(data);
}
