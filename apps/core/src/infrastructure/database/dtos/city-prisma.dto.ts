import { City } from '@/core/src/domain/entities/City';
import { CityId, Coordinates } from '@/core/src/domain/value-objects';
import { Prisma } from '@generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface PrismaCityDTO {
  id: string;
  name: string;
  state: string;
  country: string;
  slug: string;
  latitude: Decimal | null;
  longitude: Decimal | null;
  requestCount: number;
  isPopular: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export class PrismaCityMapper {
  static toDomain(prismaCity: PrismaCityDTO): City {
    return City.reconstitute({
      id: CityId.create(prismaCity.id),
      name: prismaCity.name,
      state: prismaCity.state,
      country: prismaCity.country,
      slug: prismaCity.slug,
      coordinates:
        prismaCity.latitude && prismaCity.longitude
          ? Coordinates.create(
              prismaCity.latitude.toNumber(),
              prismaCity.longitude.toNumber()
            )
          : undefined,
      requestCount: prismaCity.requestCount,
      isPopular: prismaCity.isPopular,
      lastUpdated: prismaCity.lastUpdated,
      createdAt: prismaCity.createdAt,
    });
  }

  static toPrisma(city: City): Prisma.CityCreateInput {
    return {
      id: city.id.value,
      name: city.name,
      state: city.state,
      country: city.country,
      slug: city.slug,
      latitude: city.coordinates?.latitude ?? null,
      longitude: city.coordinates?.longitude ?? null,
      requestCount: city.requestCount,
      isPopular: city.isPopular,
      lastUpdated: city.lastUpdate,
    };
  }

  static toUpdateInput(city: City): Prisma.CityUpdateInput {
    return {
      name: city.name,
      state: city.state,
      country: city.country,
      slug: city.slug,
      latitude: city.coordinates?.latitude ?? null,
      longitude: city.coordinates?.longitude ?? null,
      requestCount: city.requestCount,
      isPopular: city.isPopular,
      lastUpdated: city.lastUpdate,
    };
  }
}
