import { CachedResponse } from '../../domain/entities/CachedResponse';
import { CityId } from '../../domain/value-objects';
import { CachedResponseDTO, mapCachedResponseToDTO } from '../../dtos';
import { ICacheRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface GetCachedResponseInput {
  cityId: string | CityId
}

export interface GetCachedResponseOutput {
  cachedResponse: CachedResponseDTO | null;
  isExpired: boolean;
  remainingTTL?: number;
}

export class GetCachedResponseUseCase extends BaseUseCase<
  GetCachedResponseInput,
  GetCachedResponseOutput
> {
  constructor(private readonly cacheRepository: ICacheRepository) {
    super();
  }

  async execute(
    input: GetCachedResponseInput
  ): Promise<GetCachedResponseOutput> {
    const cityId =
      typeof input.cityId === 'string' ? input.cityId : input.cityId.toString();

    const cached = await this.cacheRepository.get(cityId);
    if (!cached) {
      return {
        cachedResponse: null,
        isExpired: false,
      };
    }

    if (cached.isExpired()) {
      return {
        cachedResponse: null,
        isExpired: true,
      };
    }

    return {
      cachedResponse: this.toDTO(cached),
      isExpired: false,
      remainingTTL: cached.getRemainingTTL(),
    };
  }

  private toDTO(entity: CachedResponse): CachedResponseDTO {
    return mapCachedResponseToDTO({
      cityId: entity.cityId,
      responseData: entity.responseData,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      hitCount: entity.hitCount,
      isExpired: entity.isExpired,
      getRemainingTTL: entity.getRemainingTTL,
    });
  }
}
