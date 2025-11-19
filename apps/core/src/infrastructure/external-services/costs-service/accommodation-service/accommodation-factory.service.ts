import { CalculateAccommodationCostsService } from './accommodation-calculate-costs.service';
import { AccommodationOrchestratorService } from './accommodation-orchestrator.service';
import { ListHotelsService } from './accomodation-list-hotels.service';

export class AccommodationServiceFactory {
  static create(): AccommodationOrchestratorService {
    const listHotelsService = new ListHotelsService();
    const calculateCostsService = new CalculateAccommodationCostsService();

    return new AccommodationOrchestratorService(
      listHotelsService,
      calculateCostsService
    );
  }
  static createWithServices(
    listHotelsService: ListHotelsService,
    calculateCostsService: CalculateAccommodationCostsService
  ): AccommodationOrchestratorService {
    return new AccommodationOrchestratorService(
      listHotelsService,
      calculateCostsService
    );
  }
}
