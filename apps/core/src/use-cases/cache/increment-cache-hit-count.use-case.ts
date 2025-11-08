import { CityId } from '../../domain/value-objects';
import { ICacheRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface IncrementCacheHitCountInput {
  cityId: string | CityId;
}

export class IncrementCacheHitCountUseCase extends BaseUseCase<
  IncrementCacheHitCountInput,
  void
> {
  constructor(private readonly cacheRepository: ICacheRepository) {
    super();
  }

  async execute(input: IncrementCacheHitCountInput): Promise<void> {
    const cityId =
      typeof input.cityId === 'string' ? input.cityId : input.cityId.toString();

    const cached = await this.cacheRepository.get(cityId);
    if (!cached) return;

    cached.incrementHitCount();
    await this.cacheRepository.set(cityId, cached);
  }
}
