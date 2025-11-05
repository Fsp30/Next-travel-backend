import { City } from '../../domain/entities/City';
import {
  CityResponseDTO,
  GetCityDTO,
  mapCityToResponseDTO,
  validateGetCityDTO,
} from '../../dtos';
import { BaseUseCase } from '../shared';
import { ICityRepository } from '../../interfaces/repositories/ICityRepository';

export type GetCityInput = GetCityDTO;
export interface GetCityOutput {
  city: CityResponseDTO;
}

export class GetCityBySlugOrCityIdUseCase extends BaseUseCase<
  GetCityInput,
  GetCityOutput
> {
  constructor(private readonly cityRepository: ICityRepository) {
    super();
  }

  async execute(input: GetCityInput): Promise<GetCityOutput> {
    const validatedData = validateGetCityDTO(input);
    const queries: Promise<City | null>[] = [];

    if (validatedData.slug) {
      queries.push(this.cityRepository.findBySlug(validatedData.slug));
    }
    if (validatedData.cityId) {
      queries.push(this.cityRepository.findById(validatedData.cityId));
    }

    if (queries.length === 0) {
      throw new Error('Nenhum campo informado');
    }

    const results = await Promise.all(queries);
    const city = results.find((c) => c !== null);

    if (!city) {
      throw new Error('Cidade não encontrada');
    }
    return {
      city: this.toDTO(city),
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
