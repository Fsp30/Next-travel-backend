import { City } from '@/core/src/domain/entities/City';
import { CityId, Coordinates } from '@/core/src/domain/value-objects';
import { ICitiesQueriesProps, ICityRepository } from '@/core/src/interfaces';
import { PrismaClient } from '@generated/prisma';
import { PrismaCityMapper } from '../dtos/city-prisma.dto';

export class CityRepository implements ICityRepository {
  private readonly POPULAR_CITY_THRESHOLD = 10;

  constructor(private prisma: PrismaClient) {}

  async create(data: City): Promise<City> {
    try {
      const new_city = await this.prisma.city.create({
        data: PrismaCityMapper.toPrisma(data),
      });

      return PrismaCityMapper.toDomain(new_city);
    } catch (error) {
      console.log('Error creating city: ', error);
      throw new Error('Falha ao criar cidade');
    }
  }

  async findById(id: string | CityId): Promise<City | null> {
    const cityId = typeof id === 'string' ? id : id.value;
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
    });

    return city ? PrismaCityMapper.toDomain(city) : null;
  }

  async findBySlug(slug: string): Promise<City | null> {
    const city = await this.prisma.city.findUnique({
      where: {
        slug: slug,
      },
    });

    return city ? PrismaCityMapper.toDomain(city) : null;
  }

  async findByNameAndState(
    name: string,
    state: string,
    countryParam?: string
  ): Promise<City | null> {
    try {
      const city = await this.prisma.city.findFirst({
        where: {
          name: name,
          state: state,
          ...(countryParam && { country: countryParam }),
        },
      });

      return city ? PrismaCityMapper.toDomain(city) : null;
    } catch (error) {
      console.error('Error finding city by name and state:', error);
      throw new Error('Falha ao buscar cidade pelo nome e estado');
    }
  }

  async update(city: City): Promise<City> {
    try {
      const updatedCity = await this.prisma.city.update({
        where: { id: city.id.value },
        data: {
          name: city.name,
          state: city.state,
          country: city.country,
          slug: city.slug,
          latitude: city.coordinates?.latitude,
          longitude: city.coordinates?.longitude,
          isPopular: city.isPopular,
          lastUpdated: city.lastUpdate,
        },
      });

      return PrismaCityMapper.toDomain(updatedCity);
    } catch (error) {
      console.log('Error updating city: ', error);
      throw new Error('Falha ao atualizar cidade');
    }
  }

  async incrementCount(id: string | CityId): Promise<void> {
    try {
      const cityId = typeof id === 'string' ? id : id.value;

      await this.prisma.city.update({
        where: { id: cityId },
        data: {
          requestCount: { increment: 1 },
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.log('Error increment request count: ', error);
      throw new Error('Falha ao incrementar número de requisições da cidade');
    }
  }

  async updateCoordinates(
    id: string | CityId,
    coordinates: Coordinates
  ): Promise<void> {
    try {
      const cityId = typeof id === 'string' ? id : id.value;

      await this.prisma.city.update({
        where: { id: cityId },
        data: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      });
    } catch (error) {
      console.log('Error updating coordinates city: ', error);
      throw new Error('Falha ao atualizar coordenadas da cidade');
    }
  }

  async findPopularCitties(limit?: number): Promise<City[] | null> {
    try {
      const cities = await this.prisma.city.findMany({
        take: limit || 20,
        skip: 0,
        where: {
          requestCount: {
            gt: this.POPULAR_CITY_THRESHOLD,
          },
        },
      });

      if (!cities) {
        console.log('There is no record of popular cities.');
        return null;
      }

      return cities.map((city) => PrismaCityMapper.toDomain(city));
    } catch (error) {
      console.log('Error finding popular cities: ', error);
      throw new Error('Falha ao buscar cidades populares');
    }
  }

  async findMany(options?: ICitiesQueriesProps): Promise<City[] | null> {
    try {
      const cities = await this.prisma.city.findMany({
        skip: options?.skip || 0,
        take: options?.take || 20,
        where: {
          ...(options?.where?.state && {
            state: { contains: options.where.state, mode: 'insensitive' },
          }),
          ...(options?.where?.country && {
            state: { contains: options.where.country, mode: 'insensitive' },
          }),
        },
        orderBy: options?.orderBy,
      });

      if (!cities) {
        console.log('There is no record cities.');
        return null;
      }

      return cities.map((city) => PrismaCityMapper.toDomain(city));
    } catch (error) {
      console.log('Error finding citties: ', error);
      throw new Error('Falha ao buscar multiplas cidades');
    }
  }

  async delete(city: City): Promise<void> {
    try {
      await this.prisma.city.delete({
        where: { id: city.id.value },
      });
    } catch (error) {
      console.log('Error deleting city: ', error);
      throw new Error('Falha ao deletar cidade');
    }
  }

  async count(): Promise<number> {
    return await this.prisma.city.count();
  }
}
