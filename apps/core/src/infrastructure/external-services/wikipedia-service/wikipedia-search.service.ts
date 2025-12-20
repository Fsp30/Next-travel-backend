import {
  WikipediaSearchDTO,
  WikipediaSearchDTOSchema,
  mapWikipediaSearchToDTO,
} from '../../../dtos/responses/external-services/wikipedia/WikipediaSearchDTO';
import { WikipediaBaseService } from './wikipedia-base.service';

export interface WikipediaSearchInput {
  query: string;
  limit?: number;
}

export interface WikipediaSearchOutput {
  data: WikipediaSearchDTO;
}

interface WikipediaSearchAPIResponse {
  query?: {
    searchinfo?: {
      text?: string;
    };
    search?: Array<{
      pageid: number;
      title: string;
      snippet: string;
    }>;
  };
}

export class WikipediaSearchService extends WikipediaBaseService<
  WikipediaSearchInput,
  WikipediaSearchOutput
> {
  async execute(input: WikipediaSearchInput): Promise<WikipediaSearchOutput> {
    this.validateInput(input);

    const response = await this.fetchSearchResults(input);
    const validatedData = this.validateResponse(response);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: WikipediaSearchInput): void {
    if (!input.query || input.query.trim().length === 0) {
      throw new Error('A consulta de busca é obrigatória.');
    }

    if (input.limit && (input.limit < 1 || input.limit > 50)) {
      throw new Error('O limite deve estar entre 1 e 50 resultados.');
    }
  }

  private async fetchSearchResults(
    input: WikipediaSearchInput
  ): Promise<WikipediaSearchAPIResponse> {
    try {
      const response = await this.http.get<WikipediaSearchAPIResponse>(
        '/search/page',
        {
          query: input.query,
          limit: input.limit ?? 10,
        }
      );
      return response;
    } catch (error) {
      console.error(
        '[WikipediaSearchService] Erro ao buscar resultados:',
        error
      );
      throw new Error('Falha ao buscar resultados da Wikipedia');
    }
  }

  private validateResponse(
    response: WikipediaSearchAPIResponse
  ): WikipediaSearchDTO {
    const mappedData = mapWikipediaSearchToDTO(response);
    const validationResult = WikipediaSearchDTOSchema.safeParse(mappedData);

    if (!validationResult.success) {
      console.error(
        '[WikipediaSearchService] Erro ao validar schema:',
        validationResult.error.issues
      );
      throw new Error('Dados da busca da Wikipedia são inválidos');
    }

    return validationResult.data;
  }
}
