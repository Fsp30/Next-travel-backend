import { CityId } from '../../domain/value-objects';
import { ICacheRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface DeleteCacheInput {
  cityId: string | CityId;
}

export interface DeleteCacheOutput {
  success: boolean;
  existed: boolean;
}

export class DeleteCacheUseCase extends BaseUseCase<
  DeleteCacheInput,
  DeleteCacheOutput
> {
  constructor(private readonly cacheRepository: ICacheRepository) {
    super();
  }

  async execute(input: DeleteCacheInput): Promise<DeleteCacheOutput> {
    const cityId =
      typeof input.cityId === 'string' ? input.cityId : input.cityId.toString();

    const existed = await this.cacheRepository.exists(cityId);

    await this.cacheRepository.delete(cityId);
    return {
      success: true,
      existed,
    };
  }
}
