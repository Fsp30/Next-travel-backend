import { SearchHistory } from '@/core/src/domain/entities/SearchHistory';
import { UserId, CityId, DateRange } from '@/core/src/domain/value-objects';
import { Prisma } from '@generated/prisma';

export interface PrismaSearchHistoryDTO {
  id: string;
  userId: string;
  cityId: string;
  travelStartDate: Date | null;
  travelEndDate: Date | null;
  searchDate: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export class PrismaSearchHistoryMapper {
  static toDomain(prismaSearchHistory: PrismaSearchHistoryDTO): SearchHistory {
    const travelDateRange =
      prismaSearchHistory.travelStartDate && prismaSearchHistory.travelEndDate
        ? DateRange.create(
            prismaSearchHistory.travelStartDate,
            prismaSearchHistory.travelEndDate
          )
        : undefined;

    return SearchHistory.reconstitute({
      id: prismaSearchHistory.id,
      userId: UserId.create(prismaSearchHistory.userId),
      cityId: CityId.create(prismaSearchHistory.cityId),
      travelDateRange,
      searchDate: prismaSearchHistory.searchDate,
      ipAddress: prismaSearchHistory.ipAddress ?? undefined,
      userAgent: prismaSearchHistory.userAgent ?? undefined,
    });
  }

  static toCreateInput(
    searchHistory: SearchHistory
  ): Prisma.SearchHistoryCreateInput {
    return {
      id: searchHistory.id,
      user: {
        connect: { id: searchHistory.userId.value },
      },
      city: {
        connect: { id: searchHistory.cityId.value },
      },
      travelStartDate: searchHistory.travelDateRange?.startDate ?? null,
      travelEndDate: searchHistory.travelDateRange?.endDate ?? null,
      searchDate: searchHistory.searchDate,
      ipAddress: searchHistory.ipAdress ?? null,
      userAgent: searchHistory.userAgent ?? null,
    };
  }

  static toUncheckedCreateInput(
    searchHistory: SearchHistory
  ): Prisma.SearchHistoryUncheckedCreateInput {
    return {
      id: searchHistory.id,
      userId: searchHistory.userId.value,
      cityId: searchHistory.cityId.value,
      travelStartDate: searchHistory.travelDateRange?.startDate ?? null,
      travelEndDate: searchHistory.travelDateRange?.endDate ?? null,
      searchDate: searchHistory.searchDate,
      ipAddress: searchHistory.ipAdress ?? null,
      userAgent: searchHistory.userAgent ?? null,
    };
  }

  static toDomainMany(
    prismaSearchHistories: PrismaSearchHistoryDTO[]
  ): SearchHistory[] {
    return prismaSearchHistories.map((record) => this.toDomain(record));
  }
}
