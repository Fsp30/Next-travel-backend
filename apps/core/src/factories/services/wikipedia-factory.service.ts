import { WikipediaOrchestratorService } from '../../infrastructure/external-services/wikipedia-service/wikipedia-orchestrator.service';
import { WikipediaSummaryService } from '../../infrastructure/external-services/wikipedia-service/wikipedia-summary.service';
import { WikipediaCityInfoService } from '../../infrastructure/external-services/wikipedia-service/wikipedia-city-info.service';
import { WikipediaSearchService } from '../../infrastructure/external-services/wikipedia-service/wikipedia-search.service';
export class WikipediaServiceFactory {
  /**
   * @returns {WikipediaOrchestratorService}
   */
  static create(): WikipediaOrchestratorService {
    const cityInfo = new WikipediaCityInfoService();
    const summary = new WikipediaSummaryService();
    const search = new WikipediaSearchService();

    return new WikipediaOrchestratorService(cityInfo, summary, search);
  }

  /**
   * @param {WikipediaCityInfoService}
   * @param {WikipediaSummaryService}
   * @param {WikipediaSearchService}
   * @returns {WikipediaOrchestratorService}
   */
  static createWithServices(
    cityInfo: WikipediaCityInfoService,
    summary: WikipediaSummaryService,
    search: WikipediaSearchService
  ): WikipediaOrchestratorService {
    return new WikipediaOrchestratorService(cityInfo, summary, search);
  }
}
