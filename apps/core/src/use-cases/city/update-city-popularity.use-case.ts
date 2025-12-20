import { ICityRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface UpdateCityPopularityInput {
  cityId: string;
}

export interface UpdateCityPopularityOutput {
  requestCount: number;
  isPopular: boolean;
  becamePopular: boolean;
}

export class UpdateCityPopularityUseCase extends BaseUseCase<
  UpdateCityPopularityInput,
  UpdateCityPopularityOutput
> {
  constructor(private readonly cityRepository: ICityRepository) {
    super();
  }

  async execute(
    input: UpdateCityPopularityInput
  ): Promise<UpdateCityPopularityOutput> {
    if (input.cityId.length < 2) {
      throw new Error('O Id da cidade deve ser maior que 1 carácter');
    }

    const city = await this.cityRepository.findById(input.cityId);
    if (!city) {
      throw new Error(`Cidade não encontrada: ID ${input.cityId}`);
    }

    const wasPopular = city.isPopular;
    city.incrementRequestCount();

    await this.cityRepository.update(city);
    const becamePopular = !wasPopular && city.isPopular;

    return {
      requestCount: city.requestCount,
      isPopular: city.isPopular,
      becamePopular,
    };
  }
}
