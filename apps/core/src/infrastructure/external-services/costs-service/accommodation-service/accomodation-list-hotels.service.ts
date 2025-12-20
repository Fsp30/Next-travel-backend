import { AccommodationBaseService } from './accommodation-base.service';
import { HotelInfo, HotelListResponse } from './interface/IHotels.interface';

export interface ListHotelsInput {
  city: string;
  limit?: number;
}

export interface ListHotelsOutput {
  hotels: HotelInfo[];
  total: number;
}

export class ListHotelsService extends AccommodationBaseService<
  ListHotelsInput,
  ListHotelsOutput
> {
  async execute(input: ListHotelsInput): Promise<ListHotelsOutput> {
    this.validateInput(input);

    if (!this.hasValidCredentials()) {
      return this.emptyResult();
    }

    const cityCode = this.mapCityToIataCode(input.city);
    if (!cityCode) {
      console.warn(`[ListHotelsService] Cidade não mapeada: ${input.city}`);
      return this.emptyResult();
    }

    try {
      const response = await this.fetchFromAPI(cityCode);
      return this.mapHotelsResponse(response, input.limit);
    } catch (error) {
      console.error('[ListHotelsService] Erro:', error);
      return this.emptyResult();
    }
  }

  private async fetchFromAPI(
    cityCode: string
  ): Promise<HotelListResponse | null> {
    const headers = await this.withDefaultHeaders();

    return this.http.get<HotelListResponse>(
      '/v1/reference-data/locations/hotels/by-city',
      { cityCode },
      headers
    );
  }

  private mapHotelsResponse(
    response: HotelListResponse | null,
    limit = 20
  ): ListHotelsOutput {
    const hotels = (response?.data ?? [])
      .filter((h) => h.hotelId && h.name)
      .slice(0, limit)
      .map((h) => ({
        hotelId: h.hotelId!,
        name: h.name!,
        cityCode: h.cityCode,
        rating: h.rating,
        geoCode: h.geoCode,
      }));

    return {
      hotels,
      total: hotels.length,
    };
  }

  private emptyResult(): ListHotelsOutput {
    return { hotels: [], total: 0 };
  }

  private validateInput(input: ListHotelsInput): void {
    if (!input.city?.trim()) {
      throw new Error('A cidade é obrigatória.');
    }

    if (input.limit && (input.limit < 1 || input.limit > 100)) {
      throw new Error('O limite deve estar entre 1 e 100.');
    }
  }
}
