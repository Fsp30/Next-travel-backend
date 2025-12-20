import {
  AccommodationCostsDTO,
  AccommodationCostsDTOSchema,
} from '../../../../dtos';
import { AccommodationBaseService } from './accommodation-base.service';
import {
  HotelListResponse,
  HotelOffersResponse,
  HotelWithOffers,
  TotalCostsBreakdown,
} from './interface/IHotels.interface';

export interface CalculateAccommodationCostsInput {
  city: string;
  checkIn: Date;
  checkOut: Date;
}

export interface CalculateAccommodationCostsOutput {
  data: AccommodationCostsDTO;
  nights: number;
  totalCosts: TotalCostsBreakdown;
  source: 'api' | 'estimated';
}

export class CalculateAccommodationCostsService extends AccommodationBaseService<
  CalculateAccommodationCostsInput,
  CalculateAccommodationCostsOutput
> {
  private readonly estimatedPrices: Record<string, AccommodationCostsDTO> = {
    'São Paulo': {
      budget: { min: 80, max: 150 },
      midRange: { min: 150, max: 350 },
      luxury: { min: 350, max: 800 },
      currency: 'BRL',
    },
    'Rio de Janeiro': {
      budget: { min: 100, max: 180 },
      midRange: { min: 180, max: 400 },
      luxury: { min: 400, max: 1000 },
      currency: 'BRL',
    },
    Brasília: {
      budget: { min: 80, max: 150 },
      midRange: { min: 150, max: 300 },
      luxury: { min: 300, max: 600 },
      currency: 'BRL',
    },
    Salvador: {
      budget: { min: 70, max: 130 },
      midRange: { min: 130, max: 280 },
      luxury: { min: 280, max: 600 },
      currency: 'BRL',
    },
    Fortaleza: {
      budget: { min: 60, max: 120 },
      midRange: { min: 120, max: 250 },
      luxury: { min: 250, max: 500 },
      currency: 'BRL',
    },
    'Belo Horizonte': {
      budget: { min: 70, max: 130 },
      midRange: { min: 130, max: 270 },
      luxury: { min: 270, max: 550 },
      currency: 'BRL',
    },
    Curitiba: {
      budget: { min: 70, max: 130 },
      midRange: { min: 130, max: 270 },
      luxury: { min: 270, max: 550 },
      currency: 'BRL',
    },
    Recife: {
      budget: { min: 60, max: 120 },
      midRange: { min: 120, max: 250 },
      luxury: { min: 250, max: 500 },
      currency: 'BRL',
    },
    'Porto Alegre': {
      budget: { min: 70, max: 130 },
      midRange: { min: 130, max: 270 },
      luxury: { min: 270, max: 550 },
      currency: 'BRL',
    },
    Florianópolis: {
      budget: { min: 80, max: 150 },
      midRange: { min: 150, max: 320 },
      luxury: { min: 320, max: 700 },
      currency: 'BRL',
    },
    default: {
      budget: { min: 60, max: 120 },
      midRange: { min: 120, max: 250 },
      luxury: { min: 250, max: 500 },
      currency: 'BRL',
    },
  };

  async execute(
    input: CalculateAccommodationCostsInput
  ): Promise<CalculateAccommodationCostsOutput> {
    this.validateInput(input);

    const nights = this.calculateNights(input.checkIn, input.checkOut);

    if (this.hasValidCredentials()) {
      try {
        const apiResult = await this.fetchFromAPI(input, nights);
        if (apiResult) {
          return apiResult;
        }
      } catch (error) {
        console.warn('[CalculateAccommodationCosts] API falhou:', error);
      }
    }

    return this.calculateEstimate(input.city, nights);
  }

  private validateInput(input: CalculateAccommodationCostsInput): void {
    if (!input.city?.trim()) {
      throw new Error('A cidade é obrigatória.');
    }

    if (!input.checkIn || !input.checkOut) {
      throw new Error('As datas de check-in e check-out são obrigatórias.');
    }

    if (input.checkIn >= input.checkOut) {
      throw new Error('A data de check-in deve ser anterior à de check-out.');
    }

    const nights = this.calculateNights(input.checkIn, input.checkOut);
    if (nights > 365) {
      throw new Error('O período não pode exceder 365 dias.');
    }
  }

  private async fetchFromAPI(
    input: CalculateAccommodationCostsInput,
    nights: number
  ): Promise<CalculateAccommodationCostsOutput | null> {
    const cityCode = this.mapCityToIataCode(input.city);
    if (!cityCode) {
      return null;
    }

    const headers = await this.withDefaultHeaders();

    const hotelIds = await this.fetchHotelIds(cityCode, headers);
    if (!hotelIds) {
      return null;
    }

    const offers = await this.fetchHotelOffers(
      hotelIds,
      input.checkIn,
      input.checkOut,
      headers
    );
    if (!offers) {
      return null;
    }

    const prices = this.extractPricesFromOffers(offers);
    if (prices.length === 0) {
      return null;
    }

    const pricePerNight = this.categorizePrices(prices);
    const validated = AccommodationCostsDTOSchema.safeParse(pricePerNight);

    if (!validated.success) {
      console.error(
        '[CalculateAccommodationCosts] Validação falhou:',
        validated.error
      );
      return null;
    }

    return this.buildOutput(validated.data, nights, 'api');
  }

  private async fetchHotelIds(
    cityCode: string,
    headers: Record<string, string>
  ): Promise<string | null> {
    try {
      const response = await this.http.get<HotelListResponse>(
        '/v1/reference-data/locations/hotels/by-city',
        { cityCode },
        headers
      );

      if (!response?.data || response.data.length === 0) {
        return null;
      }

      const hotelIds = response.data
        .filter((h): h is { hotelId: string } => !!h.hotelId)
        .slice(0, 10)
        .map((h) => h.hotelId)
        .join(',');

      return hotelIds || null;
    } catch (error) {
      console.error('[fetchHotelIds] Erro:', error);
      return null;
    }
  }

  private async fetchHotelOffers(
    hotelIds: string,
    checkIn: Date,
    checkOut: Date,
    headers: Record<string, string>
  ): Promise<HotelWithOffers[] | null> {
    try {
      const response = await this.http.get<HotelOffersResponse>(
        '/v3/shopping/hotel-offers',
        {
          hotelIds,
          checkInDate: this.formatDate(checkIn),
          checkOutDate: this.formatDate(checkOut),
          adults: 1,
          currency: 'BRL',
        },
        headers
      );

      return response?.data || null;
    } catch (error) {
      console.error('[fetchHotelOffers] Erro:', error);
      return null;
    }
  }

  private extractPricesFromOffers(offers: HotelWithOffers[]): number[] {
    const prices: number[] = [];

    for (const hotel of offers) {
      if (!hotel.offers) continue;

      for (const offer of hotel.offers) {
        if (!offer.price?.total) continue;

        const price = parseFloat(offer.price.total);
        if (!isNaN(price) && price > 0) {
          prices.push(price);
        }
      }
    }

    return prices.sort((a, b) => a - b);
  }

  private categorizePrices(prices: number[]): AccommodationCostsDTO {
    const p33 = Math.floor(prices.length * 0.33);
    const p66 = Math.floor(prices.length * 0.66);

    return {
      budget: {
        min: Math.round(prices[0]),
        max: Math.round(prices[p33] || prices[0]),
      },
      midRange: {
        min: Math.round(prices[p33] || prices[0]),
        max: Math.round(prices[p66] || prices[prices.length - 1]),
      },
      luxury: {
        min: Math.round(prices[p66] || prices[0]),
        max: Math.round(prices[prices.length - 1]),
      },
      currency: 'BRL',
    };
  }

  private buildOutput(
    pricePerNight: AccommodationCostsDTO,
    nights: number,
    source: 'api' | 'estimated'
  ): CalculateAccommodationCostsOutput {
    return {
      data: pricePerNight,
      nights,
      totalCosts: {
        budget: {
          min: (pricePerNight.budget?.min ?? 0) * nights,
          max: (pricePerNight.budget?.max ?? 0) * nights,
        },
        midRange: {
          min: (pricePerNight.midRange?.min ?? 0) * nights,
          max: (pricePerNight.midRange?.max ?? 0) * nights,
        },
        luxury: {
          min: (pricePerNight.luxury?.min ?? 0) * nights,
          max: (pricePerNight.luxury?.max ?? 0) * nights,
        },
      },
      source,
    };
  }

  private calculateEstimate(
    city: string,
    nights: number
  ): CalculateAccommodationCostsOutput {
    const pricePerNight =
      this.estimatedPrices[city] || this.estimatedPrices.default;
    return this.buildOutput(pricePerNight, nights, 'estimated');
  }
}
