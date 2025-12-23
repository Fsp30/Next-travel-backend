import { User } from '@/core/src/domain/entities/User';
import { UserId } from '@/core/src/domain/value-objects';
import { IUserRepository } from '@/core/src/interfaces';
import { PrismaClient } from '@generated/prisma';
import { PrismaUserDTO, PrismaUserMapper } from '../dtos/user-prisma.dto';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as PrismaUserDTO | null;

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findById(id: string | UserId): Promise<User | null> {
    const userId = typeof id === 'string' ? id : id.value;
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as PrismaUserDTO | null;

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { googleId: googleId },
    })) as PrismaUserDTO | null;

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: user.id.value,
          email: user.email,
          name: user.name,
          googleId: user.googleId,
          profilePicture: user.profilePicture ?? null,
          lastLogin: new Date(),
        },
      });

      return PrismaUserMapper.toDomain(newUser);
    } catch (error) {
      console.error('Error creating User:', error);
      throw new Error('Falha ao criar usuário');
    }
  }

  async update(user: User): Promise<User> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id.value },
        data: {
          name: user.name,
          profilePicture: user.profilePicture ?? null,
        },
      });

      return PrismaUserMapper.toDomain(updatedUser);
    } catch (error) {
      console.log('Error updating user', error);
      throw new Error('Falha ao atualizar usuário');
    }
  }

  async delete(id: string | UserId): Promise<void> {
    const userId = typeof id === 'string' ? id : id.value;
    try {
      await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      console.log('Error delete user', error);
      throw new Error('Falha ao deletar usuário');
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.findByEmail(email)) != null;
  }

  async existsByGoogleId(googleId: string): Promise<boolean> {
    return (await this.findByGoogleId(googleId)) != null;
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: {
      email?: string;
      name?: string;
    };
    orderBy?: {
      createdAt?: 'asc' | 'desc';
      lastLogin?: 'asc' | 'desc';
      name?: 'asc' | 'desc';
    };
  }): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        skip: options?.skip,
        take: options?.take,
        where: {
          ...(options?.where?.email && {
            email: { contains: options.where.email, mode: 'insensitive' },
          }),
          ...(options?.where?.name && {
            name: { contains: options.where.name, mode: 'insensitive' },
          }),
        },
        orderBy: options?.orderBy,
      });

      return users.map((user) => PrismaUserMapper.toDomain(user));
    } catch (error) {
      console.error('Error finding many users:', error);
      throw new Error('Failed to find users');
    }
  }
}
