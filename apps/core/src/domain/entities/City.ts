import { CityId, Coordinates } from '../value-objects';

export interface CityProps {
  id: CityId;
  name: string;
  state: string;
  country: string;
  slug: string;
  coordinates?: Coordinates;
  requestCount: number;
  isPopular: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export class City {
  private constructor(private props: CityProps) {
    this.validate();
  }

  static create(
    props: Omit<
      CityProps,
      'id' | 'slug' | 'requestCount' | 'isPopular' | 'lastUpdated' | 'createdAt'
    >
  ): City {
    return new City({
      ...props,
      id: CityId.create(),
      slug: City.generateSlug(props.name, props.state),
      requestCount: 0,
      isPopular: false,
      lastUpdated: new Date(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: CityProps): City {
    return new City(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length < 2) {
      throw new Error('Nome da cidade deve ter mais que 2 caracteres');
    }

    if (!this.props.state || this.props.state.trim().length === 0) {
      throw new Error('Estado é necessário');
    }

    if (!this.props.country || this.props.country.trim().length === 0) {
      throw new Error('País é necessário');
    }

    if (!this.props.slug || this.props.slug.trim().length === 0) {
      throw new Error('Slug é necessário');
    }

    if (this.props.requestCount < 0) {
      throw new Error('Contador de request não pode ser negativo');
    }
  }

  private static generateSlug(cityName: string, state: string): string {
    const normalize = (str: string): string => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    };

    return `${normalize(cityName)}-${normalize(state)}`;
  }

  get id(): CityId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get state(): string {
    return this.props.state;
  }

  get country(): string {
    return this.props.country;
  }

  get slug(): string {
    return this.props.slug;
  }

  get coordinates(): Coordinates | undefined {
    return this.props.coordinates;
  }

  get latitude(): number | undefined {
    return this.props.coordinates?.latitude;
  }

  get longitude(): number | undefined {
    return this.props.coordinates?.longitude;
  }

  get requestCount(): number {
    return this.props.requestCount;
  }

  get isPopular(): boolean {
    return this.props.isPopular;
  }

  get lastUpdate(): Date {
    return this.props.lastUpdated;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  incrementRequestCount(): void {
    this.props.requestCount++;
    this.props.lastUpdated = new Date();
    this.updatePopularityStatus();
  }

  private updatePopularityStatus(goalCount: number = 100): void {
    this.props.isPopular = this.props.requestCount >= goalCount;
  }

  getFullName(): string {
    return `${this.props.name} - ${this.props.state} - ${this.props.country}`;
  }

  setCoordinates(coordinates: Coordinates): void {
    this.props.coordinates = coordinates;
    this.props.lastUpdated = new Date();
  }

  toJSON() {
    return {
      id: this.props.id.toString(),
      name: this.props.name,
      state: this.props.state,
      country: this.props.country,
      slug: this.props.slug,
      latitude: this.props.coordinates?.latitude,
      longitude: this.props.coordinates?.longitude,
      requestCount: this.props.requestCount,
      isPopular: this.props.isPopular,
      lastUpdated: this.props.lastUpdated.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  toPrisma() {
    return {
      id: this.props.id.toString(),
      name: this.props.name,
      state: this.props.state,
      country: this.props.country,
      slug: this.props.slug,
      latitude: this.props.coordinates?.latitude,
      longitude: this.props.coordinates?.longitude,
      requestCount: this.props.requestCount,
      isPopular: this.props.isPopular,
      lastUpdated: this.props.lastUpdated,
      createdAt: this.props.createdAt,
    };
  }
}
