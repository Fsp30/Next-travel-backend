import { City } from '../../domain/entities/City';
import { CityResponseDTO, mapCityToResponseDTO } from '../../dtos';
import { BaseUseCase } from '../shared';
import { ICityRepository } from '../../interfaces/repositories/ICityRepository';

export interface GetPopularCitiesInput {
  limit?: number;
}

export interface GetPopularCitiesOutput {
  cities: CityResponseDTO[];
}

export class GetPopularCitiesUseCase extends BaseUseCase<
  GetPopularCitiesInput,
  GetPopularCitiesOutput
> {
  constructor(private readonly cityRepository: ICityRepository) {
    super();
  }

  async execute(input: GetPopularCitiesInput): Promise<GetPopularCitiesOutput> {
    const limit = input.limit ?? 20;

    const cities = await this.cityRepository.findPopularCities(limit);

    return {
      cities: cities.map((city) => this.toDTO(city)),
    };
  }

  private toDTO(city: City): CityResponseDTO {
    return mapCityToResponseDTO({
      id: city.id.toString(),
      name: city.name,
      state: city.state,
      country: city.country,
      slug: city.slug,
      latitude: city.latitude,
      longitude: city.longitude,
      requestCount: city.requestCount,
      isPopular: city.isPopular,
    });
  }
}
