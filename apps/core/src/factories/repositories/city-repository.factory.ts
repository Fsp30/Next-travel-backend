import { PrismaClient } from '@generated/prisma';
import { ICityRepository } from '../../interfaces';
import { CityRepository } from '../../infrastructure/database/repositories/city.repository';

export class CityRepositoryFactory {
  static create(prisma: PrismaClient): ICityRepository {
    return new CityRepository(prisma);
  }
}
