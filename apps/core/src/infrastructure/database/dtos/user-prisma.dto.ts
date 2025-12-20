import { User } from '@/core/src/domain/entities/User';
import { UserId } from '@/core/src/domain/value-objects';

export interface PrismaUserDTO {
  id: string;
  email: string;
  name: string;
  google_id: string;
  profile_picture: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUserDTO): User {
    return User.reconstitute({
      id: UserId.create(prismaUser.id),
      email: prismaUser.email,
      name: prismaUser.name,
      googleId: prismaUser.google_id,
      profilePicture: prismaUser.profile_picture ?? undefined,
      lastLogin: prismaUser.last_login ?? undefined,
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
    });
  }

  static toPrisma(user: User): Partial<PrismaUserDTO> {
    return {
      id: user.id.value,
      email: user.email,
      name: user.name,
      google_id: user.googleId,
      profile_picture: user.profilePicture ?? null,
      last_login: user.lastLogin ?? null,
    };
  }
}
