import { SearchHistory } from '../../domain/entities/SearchHistory';
import { CityId, DateRange, UserId } from '../../domain/value-objects';

export interface CreateSearchHistoryData {
  userId: UserId;
  cityId: CityId;
  travelDataRange?: DateRange;
  ipAdress?: string;
  userAgent?: string;
}

export interface FindSearchHistoryOptions {
  userId?: UserId;
  cityId: CityId;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ISearchHistoryRepostitory {
  create(data: CreateSearchHistoryData): Promise<SearchHistory>;

  findById(id: string): Promise<SearchHistory | null>;
  findByUserId(userId: string): Promise<SearchHistory | null>;
  findByCityId(
    cityId: string | CityId,
    limit?: number
  ): Promise<SearchHistory | null>;
  findMany(options: FindSearchHistoryOptions): Promise<SearchHistory[]>;
  findByRecentUserId(
    userId: string | number,
    days?: number,
    limit?: number
  ): Promise<SearchHistory[]>;

  count(options?: FindSearchHistoryOptions): Promise<number>;

  delete(id: string): Promise<void>;
  deleteByUserId(userId: string | UserId): Promise<void>;

  findTopDestinationsByUser(
    userId: string | UserId,
    limit?: number
  ): Promise<
    Array<{
      cityId: string;
      cityName: string;
      searchCount: number;
    }>
  >;
}
