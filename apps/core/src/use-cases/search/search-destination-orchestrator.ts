import { Coordinates } from "../../domain/value-objects";
import { CityResponseDTO, CostEstimateDTO, DestinationInfoResponseDTO, GetDestinationInfoDTO, validateGetDestinationInfoDTO } from "../../dtos";
import { CostsOrchestratorService, CostsServiceInput, CostsServiceOutput, WeatherOrchestratorOutput, WeatherOrchestratorService, WikipediaOrchestratorInput, WikipediaOrchestratorOutput, WikipediaOrchestratorService } from "../../infrastructure";
import { GetCachedResponseInput, GetCachedResponseOutput, GetCachedResponseUseCase, SaveCachedResponseUseCase } from "../cache";
import { CreateCityInput, CreateCityOutput, CreateCityUseCase, GetCityBySlugOrCityIdUseCase, GetCityInput, GetCityOutput, UpdateCityPopularityInput, UpdateCityPopularityOutput, UpdateCityPopularityUseCase } from "../city";
import { BaseUseCase } from "../shared";
import { generateSlug, isValidSlug } from "../shared/slug-generator";
import { CreateSearchHistoryUseCase } from "./create-search-history.use-case";
import { WeatherOrchestratorInput } from '../../infrastructure/external-services/weather-service/weather-orchestrator.service';
import { CachedResponseData, season, currecy, accommodationEnum, transportEnum, WeatherInfo } from '../../domain/entities/CachedResponse';


export type SearchDestinationInput = GetDestinationInfoDTO
export type SearchDestinationOutput = DestinationInfoResponseDTO

interface SearchDestinationDeps {
  getCityUseCase: GetCityBySlugOrCityIdUseCase;
  createCityUseCase: CreateCityUseCase;
  updateCityPopularityUseCase: UpdateCityPopularityUseCase;
  getCachedResponseUseCase: GetCachedResponseUseCase;
  saveCachedResponseUseCase: SaveCachedResponseUseCase;
  createSearchHistoryUseCase: CreateSearchHistoryUseCase;

  wikipediaOrchestrator: WikipediaOrchestratorService;
  weatherOrchestrator: WeatherOrchestratorService;
  costsOrchestrator: CostsOrchestratorService;
}

export class SearchDestinationUseCase extends BaseUseCase<
  SearchDestinationInput, SearchDestinationOutput
> {
  private readonly POPULAR_CITY_THRESHOLD = 100;
  private readonly CACHE_TTL_DAYS = 15;

  constructor(private readonly deps: SearchDestinationDeps) {
    super();
  }

  async execute(input: SearchDestinationInput): Promise<SearchDestinationOutput> {
    const request = validateGetDestinationInfoDTO(input)
    request.


    const slugGenerated = generateSlug(request.cityName, request.state)

    const city = await this.getOrCreateCity(slugGenerated, request.cityName, request.state)

    this.validateId(city.id)

    const cachedResponseCity = await this.getCacheResponse(city.id)

    if (!cachedResponseCity.cachedResponse) {

    }
  }

  private buildDestinationInfo(params: {
    city: CityResponseDTO;
    startDate?: Date;
    endDate?: Date;
    forecastDays?: number;
    targetMonth?: number;
    includeForecast?: boolean;
    includeSeasonal?: boolean;
    origin: string;
    originCoordinates?: Coordinates;
    cityCoordinates?: Coordinates;
  }): Promise<CachedResponseData> {
    

    console.log('[SearchDestinationUseCase] Buscando dados em APIs')


    const [wikipediaResult, weatherResult, costsResult] = await Promise.allSettled([
      this.fetchWikipediaOrchestrator(params.city.name, params.city.state, params.city.country),
      this.fetchWeatherOrchestrator(
        params.city.name,
        params.cityCoordinates,
        params.forecastDays,
        params.targetMonth,
        params.includeForecast,
        params.includeSeasonal
      ),
      this.fetchCostsOrchestrator(
        params.origin,
        params.city.name,
        params.startDate,
        params.endDate,
        params.originCoordinates,
        params.cityCoordinates
      )
    ])

    const wikipediaResponse = this.extractResult(wikipediaResult, 'WikipediaAPI')
    const weatherResponse = this.extractResult(weatherResult, 'WeatherAPI')
    const costsResponse = this.extractResult(costsResult, 'CostsAPI')

    console.log('[SearchDestinationUseCase] Dados buscados com sucesso.')

    const 


    const data: CachedResponseData = {
      cityInfo: wikipediaResponse?.pageInfo?.extract || wikipediaResponse?.summary?.extract || `Informações sobre ${params.city.name}`,

      weatherInfo: {
        current: weatherResponse?.current ? {
          temperature: weatherResponse.current.temperature,
          feelsLike: weatherResponse.current.feelsLike,
          temperatureMax: weatherResponse.current.temperatureMax,
          temperatureMin: weatherResponse.current.temperatureMin,
          windSpeed: weatherResponse.current.windSpeed,
          condition: weatherResponse.current.condition,
          pressure: weatherResponse.current.pressure,
          visibility: weatherResponse.current.visibility,
          humidity: weatherResponse.current.humidity,
          description: weatherResponse.current.description,
          cloudiness: weatherResponse.current.cloudiness,
        } : undefined,


        forecast: weatherResponse?.forecast?.map(item => ({
          date: new Date(item.date),
          temperature: item.temperature,
          temperatureMin: item.temperatureMin,
          temperatureMax: item.temperatureMax,
          condition: item.condition,
          humidity: item.humidity,
          description: item.description,
          chanceOfRain: item.chanceOfRain,
        })),


        seasonal: weatherResponse?.seasonal ? {
          season: weatherResponse.seasonal.season as season,
          averageTemperature: weatherResponse.seasonal.averageTemperature,
          averageRainfall: weatherResponse.seasonal.averageRainfall,
          description: weatherResponse.seasonal.description,
        } : undefined,
      },
      costsTotal: {
        accommodation: {
          budgetMin: costsResponse?.data.accommodation?.budget?.min,
          budgetMax: costsResponse?.data.accommodation?.budget?.max,
          luxuryMin: costsResponse?.data.accommodation?.luxury?.min,
          luxuryMax: costsResponse?.data.accommodation?.luxury?.max,
          midRangeMin: costsResponse?.data.accommodation?.midRange?.min,
          midRangeMax: costsResponse?.data.accommodation?.midRange?.max
        },

        transport: {
          busMin: costsResponse?.data.transport?.bus?.min,
          busMax: costsResponse?.data.transport?.bus?.max,
          flightMin: costsResponse?.data.transport?.flight?.min,
          flightMax: costsResponse?.data.transport?.flight?.max
        },
        estimateDailyBugdet: {
          bugdet: costsResponse?.data.estimateDailyBudget?.budget,
          midRange: costsResponse?.data.estimateDailyBudget?.midRange,
          luxury: costsResponse?.data.estimateDailyBudget?.luxury
        },
        totalEstimate: {
          min: costsResponse?.data.totalEstimate?.min,
          max: costsResponse?.data.totalEstimate?.max
        },
        costsSources: {
          transport: costsResponse?.sources.transport as transportEnum,
          accommodation: costsResponse?.sources.accommodation as accommodationEnum
        }

      },

      /// Filipe lembra de add a resposta da llm aqui, crie a função para gerar o texto também




    };

  }

  private async getOrCreateCity(slug: string, cityName: string, state: string): Promise<CityResponseDTO> {
    try {
      const validatedSlug = isValidSlug(slug)
      if (!validatedSlug) {
        console.log(`[SearchDestinationUseCase] Slug fora da formato adequado: ${slug}`)
        throw new Error(`[SearchDestinationUseCase] Slug fora da formato adequado: ${slug}`)
      }
      const getCityInput: GetCityInput = { slug: slug }
      const result: GetCityOutput = await this.deps.getCityUseCase.execute(getCityInput)

      return result.city

    } catch (error) {
      console.log(`[SearcDestinationUseCase] Cidade "${slug}" não encontrada. Criando ...`)


      const createCityInput: CreateCityInput = {
        name: cityName,
        state,
        country: 'Brasil'
      }

      const result: CreateCityOutput = await this.deps.createCityUseCase.execute(createCityInput)
      return result.city
    }
  }

  private async getCacheResponse(cityId: string): Promise<GetCachedResponseOutput> {
    try {
      const getCachedRespondeInput: GetCachedResponseInput = { cityId };
      const result = await this.deps.getCachedResponseUseCase.execute(getCachedRespondeInput);

      if (!result.cachedResponse) {
        console.log(`[SearchDestinationUseCase] Sem resposta em Cache. Buscando...`);
      }

      return {
        cachedResponse: result.cachedResponse ?? null,
        isExpired: result.isExpired,
        remainingTTL: result.remainingTTL ?? 0
      };

    } catch (error) {
      console.log(`[SearchDestinationUseCase] Falha ao buscar cache da Cidade ${cityId}. Buscando...`, error);

      return {
        cachedResponse: null,
        isExpired: true,
        remainingTTL: 0
      };
    }
  }


  ///FetchAPI's Nike vive
  private async fetchWikipediaOrchestrator(cityName: string, state?: string, country?: string): Promise<WikipediaOrchestratorOutput> {
    try {
      const wikipediaOrchestratorInput: WikipediaOrchestratorInput = {
        cityName,
        state,
        country,
        includeSearch: false,
        includeSummary: true
      }

      const result: WikipediaOrchestratorOutput = await this.deps.wikipediaOrchestrator.execute(wikipediaOrchestratorInput)

      return result
    } catch (error) {
      console.log('[SearchDestination] Wikipedia API error:', error)
      return {
        pageInfo: null,
        summary: null
      }
    }
  }
  private async fetchWeatherOrchestrator(
    cityName: string,
    coordinates?: Coordinates,
    forecastDays?: number,
    targetMonth?: number,
    includeForecast?: boolean,
    includeSeasonal?: boolean
  ): Promise<WeatherOrchestratorOutput> {
    try {
      const weatherOrchestratorInput: WeatherOrchestratorInput = {
        cityName,
        coordinates: coordinates ?? undefined,
        forecastDays: forecastDays ?? 5,
        targetMonth: targetMonth ?? undefined,
        includeForecast: includeForecast ?? true,
        includeSeasonal: includeSeasonal ?? false
      };

      const result: WeatherOrchestratorOutput = await this.deps.weatherOrchestrator.execute(weatherOrchestratorInput);

      return {
        current: result.current || null,
        forecast: result.forecast || null,
        seasonal: result.seasonal || null,
        location: {
          city: result.location?.city || cityName,
          coordinates: result.location?.coordinates || coordinates
        }
      };

    } catch (error) {
      console.log(`[SearchDestinationUseCase] Falha ao buscar dados meteorológicos para ${cityName}`, error);


      return {
        current: null,
        forecast: null,
        seasonal: null,
        location: {
          city: cityName,
          coordinates: coordinates
        }
      };
    }
  }

  private async fetchCostsOrchestrator(
    origin: string,
    cityName: string,
    startDate?: Date,
    endDate?: Date,
    originCoordinates?: Coordinates,
    cityCoordinates?: Coordinates
  ): Promise<CostsServiceOutput> {
    try {
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const costsServicesInput: CostsServiceInput = {
        origin,
        destination: cityName,
        startDate: start,
        endDate: end,
        originCoordinates: originCoordinates ?? undefined,
        destinationCoordinates: cityCoordinates ?? undefined,
        includeHotelsList: true,
        hotelsLimit: 20
      };

      const result = await this.deps.costsOrchestrator.execute(costsServicesInput);

      return {
        data: result.data,
        nights: result.nights,
        sources: result.sources,
        hotels: result.hotels
      };

    } catch (error) {
      console.log(`[SearchDestinationUseCase] Falha ao calcular preços de ${origin} para ${cityName}. Error:`, error);

      const fallbackData: CostEstimateDTO = {
        currency: 'BRL',
        transport: {
          bus: undefined,
          flight: undefined,
          currency: 'BRL'
        },
        accommodation: {
          budget: { min: 60, max: 120 },
          midRange: { min: 120, max: 250 },
          luxury: { min: 250, max: 500 },
          currency: 'BRL'
        },
        estimateDailyBudget: {
          budget: 110, // 60 + 50
          midRange: 220,
          luxury: 450
        },
        totalEstimate: {
          min: 770,
          max: 3150
        }
      };

      return {
        data: fallbackData,
        nights: 7,
        sources: {
          transport: "estimated",
          accommodation: "estimated"
        },
        hotels: {
          hotels: [],
          total: 0
        }
      };
    }
  }

  /// HELPERS REPOSITORIES
  private incrementCountPopularityCity(cityId: string): void {
    const updateCityPopularityInput: UpdateCityPopularityInput = {
      cityId
    };

    this.deps.updateCityPopularityUseCase.execute(updateCityPopularityInput)
      .then((result: UpdateCityPopularityOutput) => {
        const { requestCount, becamePopular, isPopular } = result;

        console.log(`[SearchDestinationUseCase] Popularidade atualizada: ${requestCount} requests`);

        return {
          requestCount,
          becamePopular,
          isPopular
        };
      })
      .catch((error: Error) => {
        console.log(`[SearchDestinationUseCase] Falha ao atualizar popularidade da cidade`, error);
      });
  }

  //HELPERS SERVICES
  private extractResult<T>(
    result: PromiseSettledResult<T | null>,
    serviceName: string
  ): T | null {
    if (result.status === 'fulfilled') {
      const value = result.value;
      const log = value ? 'log' : 'warn';

      const message = value ? 'sucesso' : 'retornou null';

      console[log](`SearchDestinationUseCase] ${serviceName} - ${message}`);
      return value;
    }

    console.error(`❌ [SearchDestinationUseCase] ${serviceName} - falha:`, result.reason);
    return null;
  }
  /// HELPERS
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('[SearchDestinationUseCase] Id da Cidade deve ser informado')
    }
    const uuidV4 = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

    const valid = uuidV4.test(id)
    if (!valid) {
      throw new Error('[SearchDestinationUseCase] Formato de Id inválido')
    }
  }



  /// LLM

  private async generatedGuideText(
    params: {
      cityName: string,
      weather: WeatherInfo,
    }
  )


}
