import z from 'zod';

export const CreateSearchDTOSchema = z
  .object({
    cityName: z
      .string()
      .min(2, 'Cidade deve ter nome com mais de 2 carateres')
      .max(100, 'Cidade deve ter nome com menos de 100 caracteres')
      .trim(),

    state: z
      .string()
      .min(2, 'Estado deve ter nome com mais de 2 carateres')
      .max(100, 'Cidade deve ter nome com menos de 100 carateres')
      .trim(),

    country: z
      .string()
      .min(2, 'Pais deve ter nome com mais de 2 carateres')
      .max(80, 'País deve ter nome com menos de 80 carateres')
      .default('Brasil'),

    travelStartDate: z.iso
      .datetime()
      .transform((string) => new Date(string))
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),

    travelEndDate: z.iso
      .datetime()
      .transform((string) => new Date(string))
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),

    userId: z.uuidv4('ID user Inválido'),

    ipAdress: z.union([z.ipv4(), z.ipv6()]).optional(),

    userAgent: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { travelStartDate, travelEndDate } = data;

    if (
      (travelStartDate && !travelEndDate) ||
      (!travelStartDate && travelEndDate)
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Ambas as datas de viagem devem ser fornecidas se uma for especificada',
        path: ['travelStartDate'],
      });
      return;
    }

    if (travelStartDate && travelEndDate) {
      const start = new Date(travelStartDate);
      const end = new Date(travelEndDate);

      if (start > end) {
        ctx.addIssue({
          code: 'custom',
          message:
            'A data de inicio de viagem deve estar antes da data de retorno',
          path: ['travelStartDate'],
        });
      }

      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 90) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duração de viagem acima de 90 dias',
          path: ['travelEndDate'],
        });
      }
    }
  });

export type CreateSearchDto = z.infer<typeof CreateSearchDTOSchema>;

export function validateCreateSearchDTO(data: unknown): CreateSearchDto {
  return CreateSearchDTOSchema.parse(data);
}
