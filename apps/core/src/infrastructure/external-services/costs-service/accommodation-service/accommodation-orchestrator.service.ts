import { AccomodationCostsDTO } from '../../../../dtos';
import { HotelInfo, TotalCostsBreakdown } from './interface/IHotels.interface';
import { AccommodationBaseService } from './accommodation-base.service';
import {
  ListHotelsInput,
  ListHotelsOutput,
  ListHotelsService,
} from './accomodation-list-hotels.service';
import {
  CalculateAccommodationCostsService,
  CalculateAccommodationCostsOutput,
  CalculateAccommodationCostsInput,
} from './accommodation-calculate-costs.service';

export interface AccommodationServiceInput {
  city: string;
  checkIn: Date;
  checkOut: Date;
  includeHotelsList?: boolean;
  hotelsLimit?: number;
}

export interface AccommodationServiceOutput {
  costs: {
    data: AccomodationCostsDTO;
    nights: number;
    totalCosts: TotalCostsBreakdown;
    source: 'api' | 'estimated';
  };
  hotels?: {
    hotels: HotelInfo[];
    total: number;
  };
}

export class AccommodationOrchestratorService extends AccommodationBaseService<
  AccommodationServiceInput,
  AccommodationServiceOutput
> {
  constructor(
    private readonly listHotelsService: ListHotelsService,
    private readonly calculateAccommodationCostsSerice: CalculateAccommodationCostsService
  ) {
    super();
  }

  async execute(
    input: AccommodationServiceInput
  ): Promise<AccommodationServiceOutput> {
    this.validateInput(input);

    const costs = await this.fetchCosts(input);

    const hotels = input.includeHotelsList
      ? await this.fetchHotels(input)
      : this.emptyResult();

    return {
      costs,
      hotels,
    };
  }
  private validateInput(input: AccommodationServiceInput): void {
    if (!input.city || input.city.trim().length === 0) {
      throw new Error('A cidade é obrigatória.');
    }
    if (!input.checkIn || !input.checkOut) {
      throw new Error('Datas de chekIn e chekOut são obrigatórias.');
    }
    if (input.checkIn > input.checkOut) {
      throw new Error('A data de chekIn deve ser anterior a data de chekOut.');
    }
    if (
      input.hotelsLimit &&
      (input.hotelsLimit < 1 || input.hotelsLimit > 100)
    ) {
      throw new Error('O limite de hotéis deve estar entre 1 e 100.');
    }
  }
  private async fetchCosts(
    input: AccommodationServiceInput
  ): Promise<CalculateAccommodationCostsOutput> {
    const costsInput: CalculateAccommodationCostsInput = {
      city: input.city,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    };

    return this.calculateAccommodationCostsSerice.execute(costsInput);
  }
  private async fetchHotels(
    input: AccommodationServiceInput
  ): Promise<ListHotelsOutput> {
    const hotelsInput: ListHotelsInput = {
      city: input.city,
      limit: input.hotelsLimit || 20,
    };

    return this.listHotelsService.execute(hotelsInput);
  }
  private emptyResult(): ListHotelsOutput {
    return { hotels: [], total: 0 };
  }
}
