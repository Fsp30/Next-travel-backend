import { ICityRepository } from '@/core/src/interfaces';
import { GetPopularCitiesUseCase } from '@/core/src/use-cases/city/get-popular-cities.use-case';

export class GetPopularCitiesFactory {
  static create(cityRepository: ICityRepository): GetPopularCitiesUseCase {
    return new GetPopularCitiesUseCase(cityRepository);
  }
}
