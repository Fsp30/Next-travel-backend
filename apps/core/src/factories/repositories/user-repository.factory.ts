import { PrismaClient } from '@generated/prisma/client';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { IUserRepository } from '../../interfaces';

export class UserRepositoryFactory {
  static create(prisma: PrismaClient): IUserRepository {
    return new UserRepository(prisma);
  }
}
