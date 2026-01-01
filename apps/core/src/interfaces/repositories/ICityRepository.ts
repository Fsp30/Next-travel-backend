import { City } from '../../domain/entities/City';
import { CityId, Coordinates } from '../../domain/value-objects';

export interface ICitiesQueriesProps {
  skip?: number;
  take?: number;
  where?: {
    state: string;
    country?: string;
  };
  orderBy?: {
    createdAt?: 'asc' | 'desc';
  };
}

export interface ICityRepository {
  create(data: City): Promise<City>;

  findById(id: string | CityId): Promise<City | null>;
  findBySlug(slug: string): Promise<City | null>;
  findByNameAndState(
    name: string,
    state: string,
    country?: string
  ): Promise<City | null>;

  update(city: City): Promise<City>;
  incrementCount(id: string | CityId): Promise<void>;
  updateCoordinates(
    id: string | CityId,
    coordinates: Coordinates
  ): Promise<void>;

  findPopularCities(limit?: number): Promise<City[]>;
  findMany(options: ICitiesQueriesProps): Promise<City[] | null>;

  delete(city: City): Promise<void>;

  count(): Promise<number>;
}
