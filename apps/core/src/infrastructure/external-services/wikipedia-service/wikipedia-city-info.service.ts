import {
  mapWikipediaPageInfoToDTO,
  WikipediaPageInfoDTO,
  WikipediaPageInfoSchema,
} from '../../../dtos/responses/external-services/wikipedia/WikipediaPageInfoDTO';
import { WikipediaBaseService } from './wikipedia-base.service';

export interface WikipediaCityInfoInput {
  cityName: string;
  state?: string;
  country?: string;
}

export interface WikipediaCityInfoOutput {
  data: WikipediaPageInfoDTO | null;
}

interface WikipediaCityInfoAPIResponse {
  query?: {
    pages?: {
      [key: string]: {
        pageid?: number;
        title?: string;
        extract?: string;
        fullurl?: string;
        thumbnail?: {
          source?: string;
        };
        coordinates?: Array<{
          lat?: number;
          lon?: number;
        }>;
        categories?: Array<{
          title?: string;
        }>;
        touched?: string;
      };
    };
  };
}

export class WikipediaCityInfoService extends WikipediaBaseService<
  WikipediaCityInfoInput,
  WikipediaCityInfoOutput
> {
  async execute(
    input: WikipediaCityInfoInput
  ): Promise<WikipediaCityInfoOutput> {
    this.validateInput(input);

    const pageTitle = this.buildPageTitle(input);
    const response = await this.fetchCityInfo(pageTitle);

    if (!response) {
      return { data: null };
    }

    const validatedData = this.validateResponse(response);

    return {
      data: validatedData,
    };
  }

  private validateInput(input: WikipediaCityInfoInput): void {
    if (!input.cityName || input.cityName.trim().length === 0) {
      throw new Error('O nome da cidade é obrigatório.');
    }
  }

  private buildPageTitle(input: WikipediaCityInfoInput): string {
    const parts = [input.cityName];

    if (input.state) {
      parts.push(input.state);
    }

    if (input.country) {
      parts.push(input.country);
    }

    return parts.join(', ');
  }

  private async fetchCityInfo(
    pageTitle: string
  ): Promise<WikipediaCityInfoAPIResponse | null> {
    try {
      const response = await this.http.get<WikipediaCityInfoAPIResponse>(
        '/page/summary',
        {
          titles: pageTitle,
          prop: 'extracts|pageimages|coordinates|categories|info',
          exintro: true,
          explaintext: true,
          piprop: 'thumbnail',
          pithumbsize: 500,
          inprop: 'url',
          redirects: 1,
        }
      );

      const pages = response?.query?.pages;
      if (!pages) {
        return null;
      }

      const pageId = Object.keys(pages)[0];
      if (pageId === '-1' || !pages[pageId]) {
        console.warn(
          `[WikipediaCityInfoService] Página não encontrada: ${pageTitle}`
        );
        return null;
      }

      return response;
    } catch (error) {
      console.error(
        '[WikipediaCityInfoService] Erro ao buscar informações da cidade:',
        error
      );
      throw new Error('Falha ao buscar informações da cidade na Wikipedia');
    }
  }

  private validateResponse(
    response: WikipediaCityInfoAPIResponse
  ): WikipediaPageInfoDTO {
    const pages = response?.query?.pages;
    if (!pages) {
      throw new Error('Resposta da API inválida');
    }

    const pageId = Object.keys(pages)[0];
    const pageData = pages[pageId];

    const mappedData = mapWikipediaPageInfoToDTO(pageData);
    const validationResult = WikipediaPageInfoSchema.safeParse(mappedData);

    if (!validationResult.success) {
      console.error(
        '[WikipediaCityInfoService] Erro ao validar schema:',
        validationResult.error.issues
      );
      throw new Error('Dados da página da Wikipedia são inválidos');
    }

    return validationResult.data;
  }
}
