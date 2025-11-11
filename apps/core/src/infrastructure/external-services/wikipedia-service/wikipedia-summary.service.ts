import {
  WikipediaSummaryDTO,
  WikipediaSummaryDTOSchema,
  mapWikipediaSummaryToDTO,
} from '../../../dtos/responses/external-services/wikipedia/WikipediaSummaryDTO';
import { WikipediaBaseService } from './wikipedia-base.service';

export interface WikipediaSummaryInput {
  title: string;
}

export interface WikipediaSummaryOutput {
  data: WikipediaSummaryDTO;
}

interface WikipediaSummaryAPIResponse {
  title: string;
  description?: string;
  extract: string;
  content_urls?: {
    desktop?: { page: string };
    mobile?: { page: string };
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  thumbnail?: {
    source: string;
  };
}

export class WikipediaSummaryService extends WikipediaBaseService<
  WikipediaSummaryInput,
  WikipediaSummaryOutput
> {
  async execute(input: WikipediaSummaryInput): Promise<WikipediaSummaryOutput> {
    this.validateInput(input);

    const response = await this.fetchSummary(input.title);
    const validatedData = this.validateResponse(response);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: WikipediaSummaryInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('O título da página é obrigatório.');
    }
  }

  private async fetchSummary(
    title: string
  ): Promise<WikipediaSummaryAPIResponse> {
    try {
      const response = await this.http.get<WikipediaSummaryAPIResponse>(
        `/page/summary/${encodeURIComponent(title)}`
      );
      return response;
    } catch (error) {
      console.error('[WikipediaSummaryService] Erro ao buscar resumo:', error);
      throw new Error('Falha ao buscar resumo da Wikipedia');
    }
  }

  private validateResponse(
    response: WikipediaSummaryAPIResponse
  ): WikipediaSummaryDTO {
    const mappedData = mapWikipediaSummaryToDTO(response);
    const validationResult = WikipediaSummaryDTOSchema.safeParse(mappedData);

    if (!validationResult.success) {
      console.error(
        '[WikipediaSummaryService] Erro ao validar schema:',
        validationResult.error.issues
      );
      throw new Error('Dados da resposta da Wikipedia são inválidos');
    }

    return validationResult.data;
  }
}
