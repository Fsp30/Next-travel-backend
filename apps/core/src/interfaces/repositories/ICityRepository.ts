import { City } from '../../domain/entities/City';
import { CityId, Coordinates } from '../../domain/value-objects';

export interface CreateCityData {
  name: string;
  state: string;
  country?: string;
  coordinates?: Coordinates;
}

export interface FindCittiesOptions {
  country?: string;
  state?: string;
  isPopular?: boolean;
  limit?: number;
  offset?: number;
}
export interface ICityRepository {
  create(data: CreateCityData): Promise<City>;

  findById(id: string | CityId): Promise<City | null>;
  findBySlug(slug: string): Promise<City | null>;
  findByNameAndState(
    name: string,
    state: string,
    country?: string
  ): Promise<City | null>;

  update(city: City): Promise<City>;
  incrementCount(id: string | CityId): Promise<void>;
  upateCoordinates(
    id: string | CityId,
    coordinates: Coordinates
  ): Promise<void>;

  findPopularCitties(limit?: number): Promise<City[]>;
  findMany(options: FindCittiesOptions): Promise<City[]>;
  findOrCreate(data: CreateCityData): Promise<City>;
  findTopSearchCitties(limit?: number): Promise<
    Array<{
      city: City;
      requestCount: number;
    }>
  >;

  delete(city: City): Promise<void>;

  count(options?: FindCittiesOptions): Promise<number>;
}
