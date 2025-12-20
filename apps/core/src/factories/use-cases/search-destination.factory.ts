import { ILLMService } from '../../../../llm/src';
import {
  ICacheRepository,
  ICityRepository,
  ISearchHistoryRepostitory,
} from '../../interfaces';
import {
  GetCachedResponseUseCase,
  SaveCachedResponseUseCase,
} from '../../use-cases/cache';
import {
  CreateCityUseCase,
  GetCityBySlugOrCityIdUseCase,
  UpdateCityPopularityUseCase,
} from '../../use-cases/city';
import {
  CreateSearchHistoryUseCase,
  SearchDestinationUseCase,
} from '../../use-cases/search';
import { CostsServiceFactory } from '../services/costs-factory.service';
import { WeatherServiceFactory } from '../services/weather-factory.service';
import { WikipediaServiceFactory } from '../services/wikipedia-factory.service';

/**
 * Factory para criar SearchDestinationUseCase com todas as dependências
 */
export class SearchDestinationFactory {
  /*
   * @returns {SearchDestinationUseCase}
   */
  static create(
    cacheRepository: ICacheRepository,
    cityRepository: ICityRepository,
    searchHistoryRepository: ISearchHistoryRepostitory,
    llmService: ILLMService
  ): SearchDestinationUseCase {
    const getCachedResponseUseCase = new GetCachedResponseUseCase(
      cacheRepository
    );
    const saveCachedResponseUseCase = new SaveCachedResponseUseCase(
      cacheRepository
    );

    const getCityUseCase = new GetCityBySlugOrCityIdUseCase(cityRepository);
    const createCityUseCase = new CreateCityUseCase(cityRepository);
    const updateCityPopularityUseCase = new UpdateCityPopularityUseCase(
      cityRepository
    );

    const createSearchHistoryUseCase = new CreateSearchHistoryUseCase(
      searchHistoryRepository
    );

    const wikipediaOrchestrator = WikipediaServiceFactory.create();
    const weatherOrchestrator = WeatherServiceFactory.create();
    const costsOrchestrator = CostsServiceFactory.create();

    return new SearchDestinationUseCase({
      getCityUseCase,
      createCityUseCase,
      updateCityPopularityUseCase,
      getCachedResponseUseCase,
      saveCachedResponseUseCase,
      createSearchHistoryUseCase,
      wikipediaOrchestrator,
      weatherOrchestrator,
      costsOrchestrator,
      llmService,
    });
  }

  static createWithUseCases(
    getCityUseCase: GetCityBySlugOrCityIdUseCase,
    createCityUseCase: CreateCityUseCase,
    updateCityPopularityUseCase: UpdateCityPopularityUseCase,
    getCachedResponseUseCase: GetCachedResponseUseCase,
    saveCachedResponseUseCase: SaveCachedResponseUseCase,
    createSearchHistoryUseCase: CreateSearchHistoryUseCase,
    llmService: ILLMService
  ): SearchDestinationUseCase {
    const wikipediaOrchestrator = WikipediaServiceFactory.create();
    const weatherOrchestrator = WeatherServiceFactory.create();
    const costsOrchestrator = CostsServiceFactory.create();

    return new SearchDestinationUseCase({
      getCityUseCase,
      createCityUseCase,
      updateCityPopularityUseCase,
      getCachedResponseUseCase,
      saveCachedResponseUseCase,
      createSearchHistoryUseCase,
      wikipediaOrchestrator,
      weatherOrchestrator,
      costsOrchestrator,
      llmService,
    });
  }

  static createWithAllDependencies(
    cacheRepository: ICacheRepository,
    cityRepository: ICityRepository,
    searchHistoryRepository: ISearchHistoryRepostitory,
    wikipediaOrchestrator: ReturnType<typeof WikipediaServiceFactory.create>,
    weatherOrchestrator: ReturnType<typeof WeatherServiceFactory.create>,
    costsOrchestrator: ReturnType<typeof CostsServiceFactory.create>,
    llmService: ILLMService
  ): SearchDestinationUseCase {
    const getCachedResponseUseCase = new GetCachedResponseUseCase(
      cacheRepository
    );
    const saveCachedResponseUseCase = new SaveCachedResponseUseCase(
      cacheRepository
    );

    const getCityUseCase = new GetCityBySlugOrCityIdUseCase(cityRepository);
    const createCityUseCase = new CreateCityUseCase(cityRepository);
    const updateCityPopularityUseCase = new UpdateCityPopularityUseCase(
      cityRepository
    );

    const createSearchHistoryUseCase = new CreateSearchHistoryUseCase(
      searchHistoryRepository
    );

    return new SearchDestinationUseCase({
      getCityUseCase,
      createCityUseCase,
      updateCityPopularityUseCase,
      getCachedResponseUseCase,
      saveCachedResponseUseCase,
      createSearchHistoryUseCase,
      wikipediaOrchestrator,
      weatherOrchestrator,
      costsOrchestrator,
      llmService,
    });
  }
}
