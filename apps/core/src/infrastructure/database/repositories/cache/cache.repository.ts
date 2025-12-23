import { Redis } from 'ioredis';
import { ICacheRepository } from '@/core/src/interfaces/repositories/ICacheRepository';
import { CachedResponse } from '@/core/src/domain/entities/CachedResponse';
import { CityId } from '@/core/src/domain/value-objects';
import {
  SerializedCachedResponse,
  SerializedWeatherInfo,
} from './serializers-cache.interfaces';

export class CacheRepository implements ICacheRepository {
  private readonly DEFAULT_TTL = 3 * 24 * 60 * 60;
  private readonly KEY_PREFIX = 'cache:city:';

  constructor(private redis: Redis) {}

  async set(
    cityId: string | CityId,
    data: CachedResponse,
    ttlInSeconds?: number
  ): Promise<void> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);
      const ttl = ttlInSeconds ?? this.DEFAULT_TTL;

      const serialized = this.serialize(data);
      const jsonData = JSON.stringify(serialized);

      await this.redis.setex(key, ttl, jsonData);

      console.log(`✅ Cached city ${cityIdValue} for ${ttl} seconds`);
    } catch (error) {
      console.error('Error setting cache:', error);
      throw new Error('Failed to set cache');
    }
  }

  async setMany(
    entries: Array<{
      cityId: string | CityId;
      data: CachedResponse;
      ttl?: number;
    }>
  ): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      entries.forEach((entry) => {
        const cityIdValue = this.extractCityId(entry.cityId);
        const key = this.buildKey(cityIdValue);
        const ttl = entry.ttl ?? this.DEFAULT_TTL;

        const serialized = this.serialize(entry.data);
        const jsonData = JSON.stringify(serialized);

        pipeline.setex(key, ttl, jsonData);
      });

      await pipeline.exec();
      console.log(`✅ Cached ${entries.length} cities in batch`);
    } catch (error) {
      console.error('Error setting many in cache:', error);
      throw new Error('Failed to set many in cache');
    }
  }

  async get(cityId: string | CityId): Promise<CachedResponse | null> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);

      const cached = await this.redis.get(key);

      if (!cached) {
        return null;
      }

      await this.incrementHitCount(cityId);

      return this.deserialize(cached);
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  async getTTL(cityId: string | CityId): Promise<number | null> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);

      const ttl = await this.redis.ttl(key);

      return ttl > 0 ? ttl : null;
    } catch (error) {
      console.error('Error getting TTL:', error);
      return null;
    }
  }

  async getMany(
    cityIds: Array<string | CityId>
  ): Promise<Map<string, CachedResponse>> {
    try {
      const pipeline = this.redis.pipeline();

      const cityIdValues = cityIds.map((id) => this.extractCityId(id));

      cityIdValues.forEach((cityId) => {
        const key = this.buildKey(cityId);
        pipeline.get(key);
      });

      const results = await pipeline.exec();
      const map = new Map<string, CachedResponse>();

      if (!results) {
        return map;
      }

      results.forEach((result, index) => {
        const [error, value] = result as [Error | null, string | null];
        const cityId = cityIdValues[index];

        if (!error && value) {
          const cached = this.deserialize(value);
          if (cached) {
            map.set(cityId, cached);
          }
        }
      });

      return map;
    } catch (error) {
      console.error('Error getting many from cache:', error);
      return new Map();
    }
  }

  async exists(cityId: string | CityId): Promise<boolean> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);

      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Error checking cache existence:', error);
      return false;
    }
  }

  async delete(cityId: string | CityId): Promise<void> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);
      const hitsKey = this.buildHitsKey(cityIdValue);

      await Promise.all([this.redis.del(key), this.redis.del(hitsKey)]);

      console.log(`🗑️  Deleted cache for city ${cityIdValue}`);
    } catch (error) {
      console.error('Error deleting from cache:', error);
      throw new Error('Failed to delete from cache');
    }
  }

  async incrementHitCount(cityId: string | CityId): Promise<void> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const hitsKey = this.buildHitsKey(cityIdValue);

      await this.redis.incr(hitsKey);
    } catch (error) {
      console.error('Error incrementing hit count:', error);
    }
  }

  async refreshTTL(
    cityId: string | CityId,
    ttlInSeconds: number
  ): Promise<void> {
    try {
      const cityIdValue = this.extractCityId(cityId);
      const key = this.buildKey(cityIdValue);

      await this.redis.expire(key, ttlInSeconds);
      console.log(
        `🔄 Refreshed TTL for city ${cityIdValue} to ${ttlInSeconds}s`
      );
    } catch (error) {
      console.error('Error refreshing TTL:', error);
      throw new Error('Failed to refresh TTL');
    }
  }

  async clear(): Promise<void> {
    try {
      const pattern = `${this.KEY_PREFIX}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`⚠️  Cleared ${keys.length} cache entries`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      const searchPattern = pattern
        ? `${this.KEY_PREFIX}${pattern}`
        : `${this.KEY_PREFIX}*`;

      const keys = await this.redis.keys(searchPattern);

      return keys
        .filter((key) => !key.includes(':hits'))
        .map((key) => key.replace(this.KEY_PREFIX, ''));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const allKeys = await this.keys();
      return allKeys.length;
    } catch (error) {
      console.error('Error counting cache entries:', error);
      return 0;
    }
  }

  // Helpers

  private buildKey(cityId: string): string {
    return `${this.KEY_PREFIX}${cityId}`;
  }

  private buildHitsKey(cityId: string): string {
    return `${this.KEY_PREFIX}${cityId}:hits`;
  }

  private extractCityId(cityId: string | CityId): string {
    return typeof cityId === 'string' ? cityId : cityId.value;
  }

  private serialize(data: CachedResponse): SerializedCachedResponse {
    const responseData = data.responseData;

    const serializedWeatherInfo: SerializedWeatherInfo | undefined =
      responseData.weatherInfo
        ? {
            current: responseData.weatherInfo.current
              ? {
                  temperature: responseData.weatherInfo.current.temperature,
                  temperatureMin:
                    responseData.weatherInfo.current.temperatureMin,
                  temperatureMax:
                    responseData.weatherInfo.current.temperatureMax,
                  feelsLike: responseData.weatherInfo.current.feelsLike,
                  condition: responseData.weatherInfo.current.condition,
                  description: responseData.weatherInfo.current.description,
                  humidity: responseData.weatherInfo.current.humidity,
                  windSpeed: responseData.weatherInfo.current.windSpeed,
                  pressure: responseData.weatherInfo.current.pressure,
                  cloudiness: responseData.weatherInfo.current.cloudiness,
                  visibility: responseData.weatherInfo.current.visibility,
                  timestamp:
                    responseData.weatherInfo.current.timestamp.toISOString(),
                }
              : undefined,
            forecast: responseData.weatherInfo.forecast?.map((f) => ({
              date: f.date.toISOString(),
              temperature: f.temperature,
              temperatureMin: f.temperatureMin,
              temperatureMax: f.temperatureMax,
              condition: f.condition,
              description: f.description,
              humidity: f.humidity,
              chanceOfRain: f.chanceOfRain,
            })),
            seasonal: responseData.weatherInfo.seasonal,
          }
        : undefined;

    return {
      cityId: data.cityId.toString(),
      responseData: {
        cityInfo: responseData.cityInfo,
        weatherInfo: serializedWeatherInfo,
        costsTotal: responseData.costsTotal,
        generatedText: responseData.generatedText,
        generatedAt: responseData.generatedAt?.toISOString(),
        hotels: responseData.hotels,
      },
      createdAt: data.createdAt.toISOString(),
      expiresAt: data.expiresAt.toISOString(),
      hitCount: data.hitCount,
    };
  }

  private deserialize(json: string): CachedResponse | null {
    try {
      const data: SerializedCachedResponse = JSON.parse(json);

      return CachedResponse.reconstitute({
        cityId: CityId.create(data.cityId),
        responseData: {
          cityInfo: data.responseData.cityInfo,
          weatherInfo: data.responseData.weatherInfo
            ? {
                current: data.responseData.weatherInfo.current
                  ? {
                      temperature:
                        data.responseData.weatherInfo.current.temperature,
                      temperatureMin:
                        data.responseData.weatherInfo.current.temperatureMin,
                      temperatureMax:
                        data.responseData.weatherInfo.current.temperatureMax,
                      feelsLike:
                        data.responseData.weatherInfo.current.feelsLike,
                      condition:
                        data.responseData.weatherInfo.current.condition,
                      description:
                        data.responseData.weatherInfo.current.description,
                      humidity: data.responseData.weatherInfo.current.humidity,
                      windSpeed:
                        data.responseData.weatherInfo.current.windSpeed,
                      pressure: data.responseData.weatherInfo.current.pressure,
                      cloudiness:
                        data.responseData.weatherInfo.current.cloudiness,
                      visibility:
                        data.responseData.weatherInfo.current.visibility,
                      timestamp: new Date(
                        data.responseData.weatherInfo.current.timestamp
                      ),
                    }
                  : undefined,
                forecast: data.responseData.weatherInfo.forecast?.map((f) => ({
                  date: new Date(f.date),
                  temperature: f.temperature,
                  temperatureMin: f.temperatureMin,
                  temperatureMax: f.temperatureMax,
                  condition: f.condition,
                  description: f.description,
                  humidity: f.humidity,
                  chanceOfRain: f.chanceOfRain,
                })),
                seasonal: data.responseData.weatherInfo.seasonal,
              }
            : undefined,
          costsTotal: data.responseData.costsTotal,
          generatedText: data.responseData.generatedText,
          generatedAt: data.responseData.generatedAt
            ? new Date(data.responseData.generatedAt)
            : undefined,
          hotels: data.responseData.hotels,
        },
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        hitCount: data.hitCount,
      });
    } catch (error) {
      console.error('Error deserializing cache:', error);
      return null;
    }
  }
}
