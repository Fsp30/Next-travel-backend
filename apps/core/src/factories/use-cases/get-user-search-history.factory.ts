import { PrismaClient } from '@generated/prisma';
import { GetUserSearchHistoryUseCase } from '../../use-cases/search';
import { SearchHistoryRepository } from '../../infrastructure/database/repositories/search-history.repository';
import { ISearchHistoryRepostitory } from '../../interfaces';

export class GetUserSearchHistoryFactory {
  static create(prisma: PrismaClient): GetUserSearchHistoryUseCase {
    const searchHistoryRepository = new SearchHistoryRepository(prisma);

    return new GetUserSearchHistoryUseCase(searchHistoryRepository);
  }

  static createWithRepository(
    searchHistoryRepository: ISearchHistoryRepostitory
  ): GetUserSearchHistoryUseCase {
    return new GetUserSearchHistoryUseCase(searchHistoryRepository);
  }
}
