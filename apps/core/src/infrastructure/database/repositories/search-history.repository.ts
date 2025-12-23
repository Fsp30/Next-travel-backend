import { SearchHistory } from '@/core/src/domain/entities/SearchHistory';
import {
  FindSearchHistoryOptions,
  ISearchHistoryRepostitory,
} from '@/core/src/interfaces';
import { PrismaClient } from '@generated/prisma';
import { PrismaSearchHistoryMapper } from '../dtos/search-history-prisma.dto';
import { CityId, UserId } from '@/core/src/domain/value-objects';

export class SearchHistoryRepository implements ISearchHistoryRepostitory {
  constructor(private prisma: PrismaClient) {}

  async create(searchHistory: SearchHistory): Promise<SearchHistory> {
    try {
      const newSearch = await this.prisma.searchHistory.create({
        data: PrismaSearchHistoryMapper.toUncheckedCreateInput(searchHistory),
      });

      return PrismaSearchHistoryMapper.toDomain(newSearch);
    } catch (error) {
      console.error('Error creating search history:', error);
      throw new Error('Falha ao criar histórico de bsuca');
    }
  }

  async findById(id: string): Promise<SearchHistory | null> {
    try {
      const search = await this.prisma.searchHistory.findUnique({
        where: { id: id },
      });

      return search ? PrismaSearchHistoryMapper.toDomain(search) : null;
    } catch (error) {
      console.error('Error finding search history by ID:', error);
      throw new Error('Falha ao buscar historico de pesquisa por ID');
    }
  }

  async findByUserId(userId: string): Promise<SearchHistory | null> {
    try {
      const search = await this.prisma.searchHistory.findFirst({
        where: { userId },
        orderBy: { searchDate: 'desc' },
      });

      return search ? PrismaSearchHistoryMapper.toDomain(search) : null;
    } catch (error) {
      console.error('Error finding search history by user:', error);
      throw new Error(
        'Falha ao buscar historico de pesquisa por ID de usuário'
      );
    }
  }

  async findByCityId(
    cityId: string | CityId,
    limit?: number
  ): Promise<SearchHistory | null> {
    try {
      const id = typeof cityId === 'string' ? cityId : cityId.value;

      const search = await this.prisma.searchHistory.findFirst({
        where: { cityId: id },
        orderBy: { searchDate: 'desc' },
        ...(limit && { take: limit }),
      });

      return search ? PrismaSearchHistoryMapper.toDomain(search) : null;
    } catch (error) {
      console.error('Error finding search history by city:', error);
      throw new Error('Falha ao buscar historico de pesquisa por cidade');
    }
  }

  async findMany(options: FindSearchHistoryOptions): Promise<SearchHistory[]> {
    try {
      const searches = await this.prisma.searchHistory.findMany({
        where: {
          ...(options.userId && { userId: options.userId.value }),
          ...(options.cityId && { cityId: options.cityId.value }),
          ...(options.startDate && {
            searchDate: { gte: options.startDate },
          }),
          ...(options.endDate && {
            searchDate: { lte: options.endDate },
          }),
        },
        orderBy: { searchDate: 'desc' },
        take: options.limit,
        skip: options.offset,
      });

      return PrismaSearchHistoryMapper.toDomainMany(searches);
    } catch (error) {
      console.error('Error finding search history:', error);
      throw new Error('Falha ao busca multiplos historicos de pesquisa');
    }
  }

  async findByRecentUserId(
    userId: string | number,
    days: number = 30,
    limit?: number
  ): Promise<SearchHistory[]> {
    try {
      const userIdStr = userId.toString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const searches = await this.prisma.searchHistory.findMany({
        where: {
          userId: userIdStr,
          searchDate: { gte: startDate },
        },
        orderBy: { searchDate: 'desc' },
        take: limit,
      });

      return PrismaSearchHistoryMapper.toDomainMany(searches);
    } catch (error) {
      console.error('Error finding recent searches by user:', error);
      throw new Error('Falha ao buscar pesquisas recentes do usuário');
    }
  }

  async count(options?: FindSearchHistoryOptions): Promise<number> {
    try {
      return await this.prisma.searchHistory.count({
        where: {
          ...(options?.userId && { userId: options.userId.value }),
          ...(options?.cityId && { cityId: options.cityId.value }),
          ...(options?.startDate && {
            searchDate: { gte: options.startDate },
          }),
          ...(options?.endDate && {
            searchDate: { lte: options.endDate },
          }),
        },
      });
    } catch (error) {
      console.error('Error counting search history:', error);
      throw new Error('Falha ao contar determinadas pesquisas de buscas');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.searchHistory.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting search history:', error);
      throw new Error('Falha ao deletar pesquisa por Id');
    }
  }

  async deleteByUserId(userId: string | UserId): Promise<void> {
    try {
      const userIdValue = typeof userId === 'string' ? userId : userId.value;

      await this.prisma.searchHistory.deleteMany({
        where: { userId: userIdValue },
      });
    } catch (error) {
      console.error('Error deleting user search history:', error);
      throw new Error('Falha ao deletar historico de pesquisa por UserId');
    }
  }

  async findTopDestinationsByUser(
    userId: string | UserId,
    limit: number = 5
  ): Promise<Array<{ cityId: string; cityName: string; searchCount: number }>> {
    try {
      const userIdValue = typeof userId === 'string' ? userId : userId.value;

      const result = await this.prisma.searchHistory.groupBy({
        by: ['cityId'],
        where: { userId: userIdValue },
        _count: { cityId: true },
        orderBy: { _count: { cityId: 'desc' } },
        take: limit,
      });
      const cityIds = result.map((item) => item.cityId);
      const cities = await this.prisma.city.findMany({
        where: { id: { in: cityIds } },
        select: { id: true, name: true },
      });

      const cityMap = new Map(cities.map((c) => [c.id, c.name]));

      return result.map((item) => ({
        cityId: item.cityId,
        cityName: cityMap.get(item.cityId) ?? 'Unknown',
        searchCount: item._count.cityId,
      }));
    } catch (error) {
      console.error('Error finding top destinations by user:', error);
      throw new Error('Falha ao buscar top destinos para user');
    }
  }
}
