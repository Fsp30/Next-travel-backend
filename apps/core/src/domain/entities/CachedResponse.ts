import {
  SeasonalWeatherDTO,
  WeatherCurrentDataDTO,
  WeatherForecastDTO,
} from '../../dtos';
import { HotelInfo } from '../../infrastructure/external-services/costs-service/accommodation-service/interface/IHotels.interface';
import { CityId } from '../value-objects/CityId';

export enum season {
  summer = 'summer',
  autumn = 'autumn',
  winter = 'winter',
  spring = 'spring',
}
export enum transportEnum {
  api = 'api',
  estimated = 'estimated',
}

export enum accommodationEnum {
  api = 'api',
  estimated = 'estimated',
}
export interface WeatherInfo {
  current?: WeatherCurrentDataDTO;
  forecast?: WeatherForecastDTO[];
  seasonal?: SeasonalWeatherDTO;
}

export interface CostsSource {
  transport: transportEnum;
  accommodation: accommodationEnum;
}

export interface CostsTotal {
  transport?: TransportCosts;
  accommodation?: AccommodationCosts;
  estimateDailyBudget?: {
    bugdet?: number;
    midRange?: number;
    luxury?: number;
  };
  totalEstimate?: {
    min?: number;
    max?: number;
  };
  costsSources: CostsSource;
}

export interface TransportCosts {
  busMin?: number;
  busMax?: number;
  flightMin?: number;
  flightMax?: number;
}

export interface AccommodationCosts {
  budgetMin?: number;
  budgetMax?: number;
  midRangeMin?: number;
  midRangeMax?: number;
  luxuryMin?: number;
  luxuryMax?: number;
}

export interface CachedResponseData {
  cityInfo: string;
  weatherInfo?: WeatherInfo;
  costsTotal?: CostsTotal;
  generatedText?: string;
  generatedAt?: Date;
  hotels?: HotelInfo[];
}

export interface CachedResponseProps {
  cityId: CityId;
  responseData: CachedResponseData;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

export class CachedResponse {
  private constructor(private props: CachedResponseProps) {
    this.validate();
  }

  static create(
    cityId: CityId,
    responseData: CachedResponseData,
    ttlInDays: number = 30
  ): CachedResponse {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlInDays * 24 * 60 * 60 * 1000);

    return new CachedResponse({
      cityId,
      responseData,
      createdAt: now,
      expiresAt,
      hitCount: 0,
    });
  }

  static reconstitute(props: CachedResponseProps): CachedResponse {
    return new CachedResponse(props);
  }

  private validate(): void {
    if (!this.props.responseData) {
      throw new Error('Response data is required');
    }

    if (this.props.expiresAt <= this.props.createdAt) {
      throw new Error('Expiration date must be after creation date');
    }
  }

  get cityId(): CityId {
    return this.props.cityId;
  }

  get responseData(): CachedResponseData {
    return this.props.responseData;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get hitCount(): number {
    return this.props.hitCount;
  }

  isExpired(): boolean {
    return new Date() >= this.props.expiresAt;
  }

  incrementHitCount(): void {
    this.props.hitCount++;
  }

  getRemainingTTL(): number {
    const now = new Date();
    const remainingMs = this.props.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  }

  getTTLInSeconds(): number {
    const now = new Date();
    const remainingMs = this.props.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  toJSON() {
    return {
      cityId: this.props.cityId.toString(),
      responseData: this.props.responseData,
      createdAt: this.props.createdAt.toISOString(),
      expiresAt: this.props.expiresAt.toISOString(),
      hitCount: this.props.hitCount,
      isExpired: this.isExpired(),
      remainingDays: this.getRemainingTTL(),
    };
  }

  toRedisFormat() {
    return JSON.stringify({
      cityId: this.props.cityId.toString(),
      responseData: this.props.responseData,
      createdAt: this.props.createdAt.toISOString(),
      expiresAt: this.props.expiresAt.toISOString(),
      hitCount: this.props.hitCount,
    });
  }
}
