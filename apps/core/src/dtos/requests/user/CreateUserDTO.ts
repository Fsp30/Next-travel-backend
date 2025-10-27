import { ipv4, ipv6, z } from 'zod';

export const CreateUserDTOSchema = z.object({
  email: z.email('Formato de email Inválido').toLowerCase().trim(),

  name: z
    .string()
    .min(2, 'O nome deve conter no minimo 2 caracteres')
    .max(100, 'O nome não deve ultrapassar 100 caracteres')
    .trim(),

  googleId: z.string().min(1, 'Google ID é necessário').trim(),

  profilePicture: z
    .url('URL de imagem de perfil inválida')
    .optional()
    .nullable(),

  ipAddress: z.union([ipv4(), ipv6()]).optional(),

  userAgent: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;

export function validateCreateUserDTO(data: unknown): CreateUserDTO {
  return CreateUserDTOSchema.parse(data);
}
