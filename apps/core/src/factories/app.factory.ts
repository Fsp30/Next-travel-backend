import { PrismaClient } from '@generated/prisma';
import Redis from 'ioredis';
import {
  CacheRepositoryFactory,
  CityRepositoryFactory,
  SearchHistoryRepositoryFactory,
  UserRepositoryFactory,
} from './repositories';
import {
  AuthServiceFactory,
  CostsServiceFactory,
  LLMServiceFactory,
  WeatherServiceFactory,
  WikipediaServiceFactory,
} from './services';
import {
  AuthenticateUserFactory,
  GetUserSearchHistoryFactory,
  RefreshTokenFactory,
  SearchDestinationFactory,
} from './use-cases';

export class AppFactory {
  private static instance: ReturnType<typeof AppFactory.create> | null = null;

  static create(prisma: PrismaClient, redis: Redis) {
    console.log('[AppFactory] Creating dependencies');

    const repositories = {
      cache: CacheRepositoryFactory.create(redis),
      user: UserRepositoryFactory.create(prisma),
      city: CityRepositoryFactory.creata(prisma),
      searchHistory: SearchHistoryRepositoryFactory.create(prisma),
    };

    const services = {
      llm: LLMServiceFactory.create(),
      auth: AuthServiceFactory.create(repositories.user),

      wikipedia: WikipediaServiceFactory.create(),
      weaather: WeatherServiceFactory.create(),
      costs: CostsServiceFactory.create(),
    };

    const useCases = {
      authenticateUser: AuthenticateUserFactory.create(
        repositories.user,
        services.auth
      ),

      refreshToken: RefreshTokenFactory.create(services.auth),

      searchdDestination: SearchDestinationFactory.createWithAllDependencies(
        repositories.cache,
        repositories.city,
        repositories.searchHistory,
        services.wikipedia,
        services.weaather,
        services.costs,
        services.llm
      ),

      getUserSearchHistory: GetUserSearchHistoryFactory.create(
        repositories.searchHistory
      ),
    };
    console.log('[AppFactory] Use Cases criados');
    console.log(' [AppFactory] Aplicação inicializada com sucesso!');

    return { repositories, services, useCases };
  }

  static getInstance(prisma: PrismaClient, redis: Redis) {
    if (!this.instance) {
      this.instance = this.create(prisma, redis);
    }
    return this.instance;
  }
  static reset(): void {
    console.log(' [AppFactory] Resetando instância singleton...');
    this.instance = null;
  }
}
