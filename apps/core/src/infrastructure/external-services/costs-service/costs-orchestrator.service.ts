import { Coordinates } from '../../../domain/value-objects';
import {
  AccomodationCostsDTO,
  CostEstimateDTO,
  CostEstimateDTOSchema,
  TransportCostsDTO,
} from '../../../dtos';
import { BaseService } from '../../shared';

import {
  AccommodationOrchestratorService,
  AccommodationServiceInput,
  AccommodationServiceOutput,
} from './accommodation-service/accommodation-orchestrator.service';
import { ListHotelsOutput } from './accommodation-service/accomodation-list-hotels.service';
import {
  CostSources,
  DailyBudgetEstimate,
  TotalEstimate,
} from './costs-interfaces/ICosts.interface';
import {
  TransportCostsInput,
  TransportCostsOutput,
  TransportCostsService,
} from './transport-service';
export interface CostsServiceInput {
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  originCoordinates?: Coordinates;
  destinationCoordinates?: Coordinates;
  includeHotelsList?: boolean;
  hotelsLimit?: number;
}

export interface CostsServiceOutput {
  data: CostEstimateDTO;
  sources: CostSources;
  nights: number;
  hotels?: ListHotelsOutput;
}

export class CostsOrchestratorService extends BaseService<
  CostsServiceInput,
  CostsServiceOutput
> {
  private readonly DAILY_FOOD_COSTS = {
    budget: 50,
    midRange: 100,
    luxury: 200,
  };

  constructor(
    private readonly transportService: TransportCostsService,
    private readonly accommodationOrchestrator: AccommodationOrchestratorService
  ) {
    super();
  }

  async execute(input: CostsServiceInput): Promise<CostsServiceOutput> {
    this.validateInput(input);

    const nights = this.calculateNights(input.startDate, input.endDate);

    const [transportResult, accommodationResult] = await Promise.allSettled([
      this.fetchTransportCosts(input),
      this.fetchAccommodationCosts(input),
    ]);

    const transport = this.extractTransportResult(transportResult);
    const accommodation = this.extractAccommodationResult(
      accommodationResult,
      input
    );

    const costEstimate = this.buildCostEstimate(
      transport.data,
      accommodation.costs.data,
      nights
    );

    const validated = this.validateCostEstimate(costEstimate);

    return {
      data: validated,
      sources: {
        transport: transport.source,
        accommodation: accommodation.costs.source,
      },
      nights,
      hotels: accommodation.hotels,
    };
  }

  private validateInput(input: CostsServiceInput): void {
    if (!input.origin?.trim()) {
      throw new Error('A origem é obrigatória.');
    }

    if (!input.destination?.trim()) {
      throw new Error('O destino é obrigatório.');
    }

    if (!input.startDate || !input.endDate) {
      throw new Error('As datas de início e término são obrigatórias.');
    }

    if (input.startDate >= input.endDate) {
      throw new Error('A data de início deve ser anterior à data de término.');
    }

    const nights = this.calculateNights(input.startDate, input.endDate);
    if (nights > 365) {
      throw new Error('O período não pode exceder 365 dias.');
    }

    if (
      input.hotelsLimit &&
      (input.hotelsLimit < 1 || input.hotelsLimit > 100)
    ) {
      throw new Error('O limite de hotéis deve estar entre 1 e 100.');
    }
  }

  private calculateNights(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async fetchTransportCosts(
    input: CostsServiceInput
  ): Promise<TransportCostsOutput> {
    const transportInput: TransportCostsInput = {
      origin: input.origin,
      destination: input.destination,
      originCoordinates: input.originCoordinates,
      destinationCoordinates: input.destinationCoordinates,
      date: input.startDate,
    };

    return this.transportService.execute(transportInput);
  }

  private async fetchAccommodationCosts(
    input: CostsServiceInput
  ): Promise<AccommodationServiceOutput> {
    const accommodationInput: AccommodationServiceInput = {
      city: input.destination,
      checkIn: input.startDate,
      checkOut: input.endDate,
      includeHotelsList: input.includeHotelsList,
      hotelsLimit: input.hotelsLimit,
    };

    return this.accommodationOrchestrator.execute(accommodationInput);
  }

  private extractTransportResult(
    result: PromiseSettledResult<TransportCostsOutput>
  ): TransportCostsOutput {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    console.error(
      '[CostsService] Falha ao buscar custos de transporte:',
      result.reason
    );

    return {
      data: {
        bus: undefined,
        flight: undefined,
        currency: 'BRL',
      },
      source: 'estimated',
    };
  }

  private extractAccommodationResult(
    result: PromiseSettledResult<AccommodationServiceOutput>,
    input: CostsServiceInput
  ): AccommodationServiceOutput {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    console.error(
      '[CostsService] Falha ao buscar custos de acomodação:',
      result.reason
    );

    return {
      costs: {
        data: {
          budget: { min: 60, max: 120 },
          midRange: { min: 120, max: 250 },
          luxury: { min: 250, max: 500 },
          currency: 'BRL',
        },
        nights: 1,
        totalCosts: {
          budget: { min: 60, max: 120 },
          midRange: { min: 120, max: 250 },
          luxury: { min: 250, max: 500 },
        },
        source: 'estimated',
      },
      hotels: input.includeHotelsList ? { hotels: [], total: 0 } : undefined,
    };
  }

  private buildCostEstimate(
    transport: TransportCostsDTO,
    accommodation: AccomodationCostsDTO,
    nights: number
  ): CostEstimateDTO {
    const dailyBudget = this.calculateDailyBudget(accommodation);
    const totalEstimate = this.calculateTotalEstimate(
      transport,
      accommodation,
      nights
    );

    return {
      transport,
      accomodation: accommodation,
      estimateDailyBudget: dailyBudget,
      totalEstimate,
      currency: 'BRL',
    };
  }

  private calculateDailyBudget(
    accommodation: AccomodationCostsDTO
  ): DailyBudgetEstimate {
    const accommodationPerNight = {
      budget: this.calculateAverage(
        accommodation.budget?.min ?? 0,
        accommodation.budget?.max ?? 0
      ),
      midRange: this.calculateAverage(
        accommodation.midRange?.min ?? 0,
        accommodation.midRange?.max ?? 0
      ),
      luxury: this.calculateAverage(
        accommodation.luxury?.min ?? 0,
        accommodation.luxury?.max ?? 0
      ),
    };

    return {
      budget: accommodationPerNight.budget + this.DAILY_FOOD_COSTS.budget,
      midRange: accommodationPerNight.midRange + this.DAILY_FOOD_COSTS.midRange,
      luxury: accommodationPerNight.luxury + this.DAILY_FOOD_COSTS.luxury,
    };
  }

  private calculateTotalEstimate(
    transport: TransportCostsDTO,
    accommodation: AccomodationCostsDTO,
    nights: number
  ): TotalEstimate {
    const transportMin = this.getMinTransportCost(transport);
    const transportMax = this.getMaxTransportCost(transport);

    const accommodationMin = (accommodation.budget?.min ?? 0) * nights;
    const accommodationMax = (accommodation.luxury?.max ?? 0) * nights;

    const foodMin = this.DAILY_FOOD_COSTS.budget * nights;
    const foodMax = this.DAILY_FOOD_COSTS.luxury * nights;

    return {
      min: transportMin + accommodationMin + foodMin,
      max: transportMax + accommodationMax + foodMax,
    };
  }

  private getMinTransportCost(transport: TransportCostsDTO): number {
    const costs: number[] = [];

    if (transport.bus?.min) costs.push(transport.bus.min);
    if (transport.flight?.min) costs.push(transport.flight.min);

    return costs.length > 0 ? Math.min(...costs) : 0;
  }

  private getMaxTransportCost(transport: TransportCostsDTO): number {
    const costs: number[] = [];

    if (transport.bus?.max) costs.push(transport.bus.max);
    if (transport.flight?.max) costs.push(transport.flight.max);

    return costs.length > 0 ? Math.max(...costs) : 0;
  }

  private calculateAverage(min: number, max: number): number {
    return Math.round((min + max) / 2);
  }

  private validateCostEstimate(data: CostEstimateDTO): CostEstimateDTO {
    const validated = CostEstimateDTOSchema.safeParse(data);

    if (!validated.success) {
      console.error(
        '[CostsService] Erro ao validar CostEstimateDTO:',
        validated.error.issues
      );
      throw new Error('Dados de estimativa de custos são inválidos.');
    }

    return validated.data;
  }
}
