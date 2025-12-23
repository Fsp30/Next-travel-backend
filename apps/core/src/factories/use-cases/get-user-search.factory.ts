import { ISearchHistoryRepostitory } from '../../interfaces';
import { GetUserSearchHistoryUseCase } from '../../use-cases/search';

export class GetUserSearchHistoryFactory {
  static create(
    searchRepository: ISearchHistoryRepostitory
  ): GetUserSearchHistoryUseCase {
    return new GetUserSearchHistoryUseCase(searchRepository);
  }
}
