import { CachedResponse } from '../../domain/entities/CachedResponse';
import { CityId } from '../../domain/value-objects';

export interface ICacheRepository {
  set(
    cityId: string | CityId,
    data: CachedResponse,
    ttlnSeconds?: number
  ): Promise<void>;
  setMany(
    entries: Array<{
      cityId: string | CityId;
      data: CachedResponse;
      ttl?: number;
    }>
  ): Promise<void>;

  get(cityId: string | CityId): Promise<CachedResponse | null>;
  getTTL(cityId: string | CityId): Promise<number | null>;
  getMany(
    cityIds: Array<string | CityId>
  ): Promise<Map<string, CachedResponse>>;

  exists(cityId: string | CityId): Promise<boolean>;

  delete(cityId: string | CityId): Promise<void>;

  incrementHitCount(cityId: string | CityId): Promise<void>;
  refreshTTL(cityId: string | CityId, ttlInSeconds: number): Promise<void>;

  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  count(): Promise<number>;
}
