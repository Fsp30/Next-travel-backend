import { z } from 'zod';

export const UserResponseDTOSchema = z.object({
  id: z.uuidv4(),
  email: z.email(),
  name: z.string(),
  profilePicture: z.url().optional().nullable(),
  createdAt: z.iso.datetime(),
  lastLogin: z.iso.datetime().optional().nullable(),
});

export type UserResponseDTO = z.infer<typeof UserResponseDTOSchema>;

export function mapUserToResponseDTO(user: {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  createdAt: Date;
  lastLogin?: Date;
}): UserResponseDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin?.toISOString(),
  };
}
