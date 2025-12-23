import { ConnectionOptions } from 'tls';
import { CacheRepository } from '../../infrastructure/database/repositories/cache/cache.repository';
import { ICacheRepository } from '../../interfaces/repositories/ICacheRepository';
import { Redis } from 'ioredis';

type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db?: number;

  tls?: ConnectionOptions;

  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  connectTimeout?: number;
};
export class CacheRepositoryFactory {
  static create(redis: Redis): ICacheRepository {
    return new CacheRepository(redis);
  }
  static createWithConfig(config: RedisConfig): ICacheRepository {
    const redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db ?? 0,
      tls: config.tls,
      maxRetriesPerRequest: config.maxRetriesPerRequest ?? 3,
      enableReadyCheck: config.enableReadyCheck !== false,
      connectTimeout: config.connectTimeout ?? 10000,
      retryStrategy: (times) => {
        if (times > 10) {
          console.error('❌ Redis: Max retry attempts reached');
          return null;
        }
        return Math.min(times * 50, 2000);
      },
      lazyConnect: false,
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    });

    redis.on('connect', () => {
      console.log('Redis: Connected successfully');
    });

    redis.on('ready', () => {
      console.log('Redis: Ready to accept commands');
    });

    redis.on('error', (error) => {
      console.error('Redis: Connection error:', error.message);
    });

    redis.on('close', () => {
      console.warn('Redis: Connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('Redis: Reconnecting...');
    });

    return new CacheRepository(redis);
  }

  static createForUpstash(
    upstashUrl: string,
    upstashToken: string
  ): ICacheRepository {
    const url = new URL(upstashUrl);
    const host = url.hostname;
    const port = parseInt(url.port) || 6379;

    const redis = new Redis({
      host,
      port,
      password: upstashToken,
      tls: {
        rejectUnauthorized: true,
      },
      family: 6,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      retryStrategy: (times) => {
        if (times > 5) return null;
        return Math.min(times * 100, 2000);
      },
    });

    redis.on('error', (error) => {
      console.error('Upstash Redis error:', error.message);
    });

    return new CacheRepository(redis);
  }

  static createForTesting(
    host: string = 'localhost',
    port: number = 6379
  ): ICacheRepository {
    const redis = new Redis({
      host,
      port,
      db: 15,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      enableReadyCheck: false,
      retryStrategy: () => null,
      lazyConnect: true,
      showFriendlyErrorStack: true,
    });

    return new CacheRepository(redis);
  }
}
