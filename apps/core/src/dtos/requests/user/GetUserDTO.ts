import z from 'zod';

export const GetUserDTOSchema = z
  .object({
    id: z.uuidv4('Formato de Id Inválido').optional(),

    email: z.email('Formato de email Inválido').toLowerCase().trim().optional(),

    googleId: z.string().min(1).trim().optional(),
  })
  .refine((data) => data.id || data.email || data.email, {
    message: 'Uma forma de identificação deve ser fornecida',
    path: ['id'],
  });

export type GetUserDTO = z.infer<typeof GetUserDTOSchema>;

export function validateGetUserDTO(data: unknown): GetUserDTO {
  return GetUserDTOSchema.parse(data);
}
