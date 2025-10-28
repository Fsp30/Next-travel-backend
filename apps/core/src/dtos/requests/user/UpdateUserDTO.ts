import z from 'zod';

export const UpdateUserDTOSchema = z
  .object({
    userId: z.uuidv4('ID de usuário Inválido'),

    name: z
      .string()
      .min(2, 'O nome deve conter no minimo 2 caracteres')
      .max(100, 'O nome não deve ultrapassar 100 caracteres')
      .trim()
      .optional(),

    profilePicture: z.url('URL de imagem de perfil inválida').optional().nullable(),
  })
  .refine((data) => data.name || data.profilePicture, {
    message: 'Ao menos uma alteração deve ser feita',
    path: ['userId'],
  });

export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;

export function validateUpdateUserDTO(data: unknown): UpdateUserDTO {
  return UpdateUserDTOSchema.parse(data);
}
