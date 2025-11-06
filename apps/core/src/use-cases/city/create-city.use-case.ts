import { City } from '../../domain/entities/City';
import { Coordinates } from '../../domain/value-objects';
import {
  CityResponseDTO,
  CreateCityDTO,
  mapCityToResponseDTO,
  validateCreateCityDTO,
} from '../../dtos';
import { ICityRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export type CreateCityInput = CreateCityDTO;
export interface CreateCityOutput {
  city: CityResponseDTO;
  isNewCity: boolean;
}

export class CreateCityUseCase extends BaseUseCase<
  CreateCityInput,
  CreateCityOutput
> {
  constructor(private readonly cityRespository: ICityRepository) {
    super();
  }

  async execute(input: CreateCityInput): Promise<CreateCityOutput> {
    const validatedData = validateCreateCityDTO(input);

    const existingCity = await this.cityRespository.findByNameAndState(
      validatedData.name,
      validatedData.state,
      validatedData.country
    );

    if (existingCity) {
      return {
        city: this.toDTO(existingCity),
        isNewCity: false,
      };
    }
    const hasCoords = validatedData.latitude && validatedData.longitude;

    const newCity = City.create({
      name: validatedData.name,
      state: validatedData.state,
      country: validatedData.country,
      coordinates: hasCoords
        ? Coordinates.create(validatedData.latitude!, validatedData.longitude!)
        : undefined,
    });

    const savedCity = await this.cityRespository.create(newCity);

    return {
      city: this.toDTO(savedCity),
      isNewCity: true,
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
