import { SearchHistoryRepository } from '../../infrastructure/database/repositories/search-history.repository';
import { ISearchHistoryRepostitory } from '../../interfaces/repositories/ISearchHistoryRepository';
import { PrismaClient } from '@generated/prisma/client';

export class SearchHistoryRepositoryFactory {
  static create(prisma: PrismaClient): ISearchHistoryRepostitory {
    return new SearchHistoryRepository(prisma);
  }
}
