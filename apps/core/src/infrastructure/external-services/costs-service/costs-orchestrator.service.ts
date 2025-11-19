import { Coordinates } from "../../../domain/value-objects";
import { CostEstimateDTO } from "../../../dtos";
import { BaseService } from "../../shared";
import { CalculateAccommodationCostsService } from "./accommodation-service/accommodation-calculate-costs.service";
import { CostSources } from "./costs-interfaces/ICosts.interface";
import { TransportCostsService } from "./transport-service";

export interface CostsServiceInput {
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  originCoordinates?: Coordinates;
  destinationCoordinates?: Coordinates;
}

export interface CostsServiceOutput {
  data: CostEstimateDTO;
  sources: CostSources;
  nights: number;
}

export class CostsOrchestratorService extends BaseService<CostsServiceInput, CostsServiceOutput>{
        private readonly DAILY_FOOD_COSTS = {
                budget: 50,    
                midRange: 100, 
                luxury: 200,   
        };
        constructor(
                private readonly transportService: TransportCostsService,
                private readonly accommodationService = CalculateAccommodationCostsService
        )
}