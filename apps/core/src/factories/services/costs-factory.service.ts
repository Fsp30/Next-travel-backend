import { CalculateAccommodationCostsService } from '../../infrastructure/external-services/costs-service/accommodation-service/accommodation-calculate-costs.service';
import { AccommodationOrchestratorService } from '../../infrastructure/external-services/costs-service/accommodation-service/accommodation-orchestrator.service';
import { ListHotelsService } from '../../infrastructure/external-services/costs-service/accommodation-service/accomodation-list-hotels.service';

import { CostsOrchestratorService } from '../../infrastructure/external-services/costs-service/costs-orchestrator.service';
import { TransportCostsService } from '../../infrastructure/external-services/costs-service/transport-service';

export class CostsServiceFactory {
  /**
   * @returns {CostsOrchestratorService}
   */
  static create(): CostsOrchestratorService {
    const listHotelsService = new ListHotelsService();
    const calculateAccommodationCostsService =
      new CalculateAccommodationCostsService();

    const accommodationService = new AccommodationOrchestratorService(
      listHotelsService,
      calculateAccommodationCostsService
    );

    const transportService = new TransportCostsService();

    return new CostsOrchestratorService(transportService, accommodationService);
  }

  /**
   * @param {TransportCostsService}
   * @param {AccommodationOrchestratorService}
   * @returns {CostsOrchestratorService}
   */
  static createWithServices(
    transportService: TransportCostsService,
    accommodationService: AccommodationOrchestratorService
  ): CostsOrchestratorService {
    return new CostsOrchestratorService(transportService, accommodationService);
  }

  /**
  
   * @param {TransportCostsService} 
   * @param {ListHotelsService}
   * @param {CalculateAccommodationCostsService} 
   * @returns {CostsOrchestratorService} 
   */
  static createWithAllServices(
    transportService: TransportCostsService,
    listHotelsService: ListHotelsService,
    calculateAccommodationCostsService: CalculateAccommodationCostsService
  ): CostsOrchestratorService {
    const accommodationService = new AccommodationOrchestratorService(
      listHotelsService,
      calculateAccommodationCostsService
    );

    return new CostsOrchestratorService(transportService, accommodationService);
  }
}
