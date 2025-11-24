import {
  WikipediaPageInfoDTO,
  WikipediaSearchDTO,
  WikipediaSummaryDTO,
} from '../../../dtos';
import {
  WikipediaCityInfoInput,
  WikipediaCityInfoOutput,
  WikipediaCityInfoService,
} from './wikipedia-city-info.service';
import {
  WikipediaSearchInput,
  WikipediaSearchOutput,
  WikipediaSearchService,
} from './wikipedia-search.service';
import {
  WikipediaSummaryInput,
  WikipediaSummaryOutput,
  WikipediaSummaryService,
} from './wikipedia-summary.service';

export interface WikipediaOrchestratorInput {
  cityName: string;
  state?: string;
  country?: string;
  includeSearch?: boolean;
  includeSummary?: boolean;
}

export interface WikipediaOrchestratorOutput {
  pageInfo: WikipediaPageInfoDTO | null;
  summary?: WikipediaSummaryDTO | null;
  searchResults?: WikipediaSearchDTO | null;
}

export class WikipediaOrchestratorService {
  constructor(
    private readonly cityInfoService: WikipediaCityInfoService,
    private readonly summaryService: WikipediaSummaryService,
    private readonly searchService: WikipediaSearchService
  ) {}

  async execute(
    input: WikipediaOrchestratorInput
  ): Promise<WikipediaOrchestratorOutput> {
    this.validateInput(input);

    const pageInfo = await this.fetchPageInfo(input);

    if (!pageInfo) {
      return {
        pageInfo: null,
        summary: undefined,
        searchResults: undefined,
      };
    }

    const [summary, searchResults] = await Promise.allSettled([
      input.includeSummary ? this.fetchSummary(pageInfo.title) : null,
      input.includeSearch ? this.fetchSearchResults(input.cityName) : null,
    ]);

    return {
      pageInfo,
      summary: this.extractResult(summary),
      searchResults: this.extractResult(searchResults),
    };
  }

  private validateInput(input: WikipediaOrchestratorInput): void {
    if (!input.cityName?.trim()) {
      throw new Error('O nome da cidade é obrigatório.');
    }
  }

  private async fetchPageInfo(
    input: WikipediaOrchestratorInput
  ): Promise<WikipediaPageInfoDTO | null> {
    try {
      const cityInfoInput: WikipediaCityInfoInput = {
        cityName: input.cityName,
        state: input.state,
        country: input.country,
      };

      const result: WikipediaCityInfoOutput =
        await this.cityInfoService.execute(cityInfoInput);
      return result.data;
    } catch (error) {
      console.error(
        '[WikipediaOrchestrator] Erro ao buscar informações da página:',
        error
      );
      return null;
    }
  }

  private async fetchSummary(
    title: string
  ): Promise<WikipediaSummaryDTO | null> {
    try {
      const summaryInput: WikipediaSummaryInput = { title };
      const result: WikipediaSummaryOutput =
        await this.summaryService.execute(summaryInput);
      return result.data;
    } catch (error) {
      console.error('[WikipediaOrchestrator] Erro ao buscar resumo:', error);
      return null;
    }
  }

  private async fetchSearchResults(
    query: string
  ): Promise<WikipediaSearchDTO | null> {
    try {
      const searchInput: WikipediaSearchInput = { query, limit: 5 };
      const result: WikipediaSearchOutput =
        await this.searchService.execute(searchInput);
      return result.data;
    } catch (error) {
      console.error(
        '[WikipediaOrchestrator] Erro ao buscar resultados:',
        error
      );
      return null;
    }
  }

  private extractResult<T>(
    result: PromiseSettledResult<T | null>
  ): T | null | undefined {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return undefined;
  }
}
