import z from 'zod';

export const AuthenticateUserDTOSchema = z.object({
  googleToken: z.string().min(1, 'Token Google necessário'),
  ipAdress: z.union([z.ipv4(), z.ipv6()]).optional(),
  userAgent: z.string().optional(),
});

export type AuthenticateUserDTO = z.infer<typeof AuthenticateUserDTOSchema>;

export function validateAuthenticateUserDTO(
  data: unknown
): AuthenticateUserDTO {
  return AuthenticateUserDTOSchema.parse(data);
}
