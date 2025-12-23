import { User } from '@/core/src/domain/entities/User';
import { UserId } from '@/core/src/domain/value-objects';

export interface PrismaUserDTO {
  id: string;
  email: string;
  name: string;
  googleId: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUserDTO): User {
    return User.reconstitute({
      id: UserId.create(prismaUser.id),
      email: prismaUser.email,
      name: prismaUser.name,
      googleId: prismaUser.googleId,
      profilePicture: prismaUser.profilePicture ?? undefined,
      lastLogin: prismaUser.lastLogin ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  static toPrisma(user: User): Partial<PrismaUserDTO> {
    return {
      id: user.id.value,
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      profilePicture: user.profilePicture ?? null,
      lastLogin: user.lastLogin ?? null,
    };
  }
}
