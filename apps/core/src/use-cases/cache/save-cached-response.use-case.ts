import {
  CachedResponse,
  CachedResponseData,
} from '../../domain/entities/CachedResponse';
import { CityId } from '../../domain/value-objects';
import { ICacheRepository } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface SaveCachedResponseInput {
  cityId: string | CityId;
  responseData: CachedResponseData;
  ttlInDays?: number;
}
export interface SaveCachedResponseOutput {
  success: boolean;
  expiresAt: string;
  ttlInDays: number;
}

export class SaveCachedResponseUseCase extends BaseUseCase<
  SaveCachedResponseInput,
  SaveCachedResponseOutput
> {
  private readonly DEFAULT_TTL_DAYS = 3;
  constructor(private readonly cacheRepository: ICacheRepository) {
    super();
  }

  async execute(
    input: SaveCachedResponseInput
  ): Promise<SaveCachedResponseOutput> {
    if (!input.responseData) {
      throw new Error('É necessário os dados para setar cache');
    }

    const cityId = this.ensureCityId(input.cityId);

    const ttlInDays = input.ttlInDays ?? this.DEFAULT_TTL_DAYS;

    const cachedResponse = CachedResponse.create(
      cityId,
      input.responseData,
      ttlInDays
    );

    const ttlInSeconds = cachedResponse.getTTLInSeconds();

    await this.cacheRepository.set(cityId, cachedResponse, ttlInSeconds);

    return {
      success: true,
      expiresAt: cachedResponse.expiresAt.toISOString(),
      ttlInDays,
    };
  }
  private ensureCityId(cityId: string | CityId): CityId {
    if (typeof cityId === 'string') {
      if (!this.isValidUUID(cityId)) {
        throw new Error(`Invalid city ID format: ${cityId}`);
      }
      return CityId.fromString(cityId);
    }
    return cityId;
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
