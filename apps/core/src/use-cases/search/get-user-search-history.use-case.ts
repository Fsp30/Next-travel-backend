import { UserId } from '../../domain/value-objects';
import { ISearchHistoryRepostitory } from '../../interfaces';
import { BaseUseCase } from '../shared';

export interface GetUserSearchHistoryInput {
  userId: string;
  limit?: number;
  daysThreshold?: number;
}

export interface SearchHistoryItemDTO {
  id: string;
  cityId: string;
  cityName?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  searchDate: string;
  isRecent: boolean;
}

export interface GetUserSearchHistoryOutput {
  searches: SearchHistoryItemDTO[];
  total: number;
  userId: string;
}

export class GetUserSearchHistoryUseCase extends BaseUseCase<
  GetUserSearchHistoryInput,
  GetUserSearchHistoryOutput
> {
  constructor(
    private readonly searchHistoryRepository: ISearchHistoryRepostitory
  ) {
    super();
  }

  async execute(
    input: GetUserSearchHistoryInput
  ): Promise<GetUserSearchHistoryOutput> {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('UserID é necessário');
    }

    const userId = this.ensureUserId(input.userId);

    const limit = input.limit ?? 0;
    const daysThreshold = input.daysThreshold ?? 60;

    const searches = await this.searchHistoryRepository.findByRecentUserId(
      userId.toString(),
      daysThreshold,
      limit
    );

    const searchDTOs: SearchHistoryItemDTO[] = searches.map((search) => ({
      id: search.id,
      cityId: search.cityId.toString(),
      cityName: undefined,
      travelStartDate: search.travelDateRange?.startDate.toISOString(),
      travelEndDate: search.travelDateRange?.endDate.toISOString(),
      searchDate: search.searchDate.toISOString(),
      isRecent: search.isRecent(daysThreshold),
    }));

    return {
      searches: searchDTOs,
      total: searchDTOs.length,
      userId: input.userId,
    };
  }
  private ensureUserId(userId: string | UserId): UserId {
    if (typeof userId === 'string') {
      if (!this.isValidUUID(userId)) {
        throw new Error(`Invalid user ID format: ${userId}`);
      }
      return UserId.fromString(userId);
    }
    return userId;
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
