import { PrismaClient } from '@generated/prisma/client';
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
import { GetUserFactory } from './use-cases/user/get-user.factory';
import { UpdateUserFactory } from './use-cases/user/update-user.factory';
import { DeleteUserFactory } from './use-cases/user/delete-user.factory';
import { CreateUserFactory } from './use-cases/user/create-user.factory';
import { GetPopularCitiesFactory } from './use-cases/city';

export class AppFactory {
  private static instance: ReturnType<typeof AppFactory.create> | null = null;

  static create(prisma: PrismaClient, redis: Redis) {
    console.log('[AppFactory] Creating dependencies');

    const repositories = {
      cache: CacheRepositoryFactory.create(redis),
      user: UserRepositoryFactory.create(prisma),
      city: CityRepositoryFactory.create(prisma),
      searchHistory: SearchHistoryRepositoryFactory.create(prisma),
    };

    const services = {
      llm: LLMServiceFactory.create(),
      auth: AuthServiceFactory.create(repositories.user),

      wikipedia: WikipediaServiceFactory.create(),
      weather: WeatherServiceFactory.create(),
      costs: CostsServiceFactory.create(),
    };

    const useCases = {
      getUser: GetUserFactory.create(repositories.user),
      createUser: CreateUserFactory.create(repositories.user),
      updateUser: UpdateUserFactory.create(repositories.user),
      deleteUser: DeleteUserFactory.create(repositories.user),

      authenticateUser: AuthenticateUserFactory.create(
        repositories.user,
        services.auth
      ),

      getPopularCities: GetPopularCitiesFactory.create(repositories.city),

      refreshToken: RefreshTokenFactory.create(services.auth),

      searchDestination: SearchDestinationFactory.createWithAllDependencies(
        repositories.cache,
        repositories.city,
        repositories.searchHistory,
        services.wikipedia,
        services.weather,
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
