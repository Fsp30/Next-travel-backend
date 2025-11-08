import { CityId, DateRange, UserId } from '../../domain/value-objects';
import { CreateSearchDto, validateCreateSearchDTO } from '../../dtos';
import { ISearchHistoryRepostitory } from '../../interfaces';
import { BaseUseCase } from '../shared';
import { SearchHistory } from '../../domain/entities/SearchHistory';

export type CreateSearchHistoryInput = CreateSearchDto;
export interface CreateSearchHistoryOutput {
  searchHistoryId: string;
  success: boolean;
}

export class CreateSearchHistoryUseCase extends BaseUseCase<
  CreateSearchHistoryInput,
  CreateSearchHistoryOutput
> {
  constructor(
    private readonly searchHistoryRepository: ISearchHistoryRepostitory
  ) {
    super();
  }

  async execute(input: CreateSearchDto): Promise<CreateSearchHistoryOutput> {
    const validatedData = validateCreateSearchDTO(input);

    const cityId = this.ensureCityId(input.cityId);
    const userId = this.ensureUserId(input.userId);

    let travelDateRange: DateRange | undefined;
    if (validatedData.travelStartDate && validatedData.travelEndDate) {
      travelDateRange = DateRange.create(
        new Date(validatedData.travelStartDate),
        new Date(validatedData.travelEndDate)
      );
    }

    SearchHistory.create({
      userId,
      cityId,
      travelDateRange,
      ipAddress: validatedData.ipAdress,
      userAgent: validatedData.userAgent,
    });
    const saved = await this.searchHistoryRepository.create({
      userId,
      cityId,
      travelDataRange: travelDateRange,
      ipAdress: validatedData.ipAdress,
      userAgent: validatedData.userAgent,
    });

    return {
      searchHistoryId: saved.id,
      success: true,
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
