import { BaseUseCase } from '../shared';
import { generateSlug, isValidSlug } from '../shared/slug-generator';

import {
  accommodationEnum,
  CachedResponseData,
  CostsSource,
  season,
  transportEnum,
  WeatherInfo,
} from '../../domain/entities/CachedResponse';
import { Coordinates } from '../../domain/value-objects';

import {
  CityResponseDTO,
  DestinationInfoResponseDTO,
  GetDestinationInfoDTO,
  validateGetDestinationInfoDTO,
} from '../../dtos';

import {
  CostsOrchestratorService,
  CostsServiceInput,
  CostsServiceOutput,
  WeatherOrchestratorInput,
  WeatherOrchestratorOutput,
  WeatherOrchestratorService,
  WikipediaOrchestratorInput,
  WikipediaOrchestratorOutput,
  WikipediaOrchestratorService,
} from '../../infrastructure';
import {
  GetCachedResponseOutput,
  GetCachedResponseUseCase,
  SaveCachedResponseUseCase,
} from '../cache';
import {
  CreateCityUseCase,
  GetCityBySlugOrCityIdUseCase,
  UpdateCityPopularityOutput,
  UpdateCityPopularityUseCase,
} from '../city';

import {
  CreateSearchHistoryInput,
  CreateSearchHistoryUseCase,
} from './create-search-history.use-case';

import { GenerateTravelGuideInput, ILLMService } from '../../../../llm/src';
import { CachedResponseRaw, IFetchedCityData } from '../helperInterfaces';

export type Input = GetDestinationInfoDTO;
export type Output = DestinationInfoResponseDTO;

interface SearchDestinationDependecies {
  getCityUseCase: GetCityBySlugOrCityIdUseCase;
  createCityUseCase: CreateCityUseCase;
  updateCityPopularityUseCase: UpdateCityPopularityUseCase;
  getCachedResponseUseCase: GetCachedResponseUseCase;
  saveCachedResponseUseCase: SaveCachedResponseUseCase;
  createSearchHistoryUseCase: CreateSearchHistoryUseCase;

  wikipediaOrchestrator: WikipediaOrchestratorService;
  weatherOrchestrator: WeatherOrchestratorService;
  costsOrchestrator: CostsOrchestratorService;

  llmService: ILLMService;
}

export class SearchDestinationUseCase extends BaseUseCase<Input, Output> {
  private readonly POPULAR_CITY_THRESHOLD = 10;
  private readonly CACHE_TTL_DAYS = 3;

  constructor(private readonly deps: SearchDestinationDependecies) {
    super();
  }

  async execute(input: Input): Promise<Output> {
    const request = validateGetDestinationInfoDTO(input);

    console.log(
      `[SearchDestination] 🔍 Iniciando busca: ${request.cityName}, ${request.state}`
    );

    const slug = generateSlug(request.cityName, request.state);
    const city = await this.getOrCreateCity(
      slug,
      request.cityName,
      request.state
    );

    console.log(
      `[SearchDestination] 📍 Cidade encontrada: ${city.name} (ID: ${city.id})`
    );

    this.updateCityPopularityAsync(city.id);

    const cachedResponse = await this.getCachedData(city.id);

    if (cachedResponse && cachedResponse.cachedResponse) {
      console.log(
        `[SearchDestination] ✅ Cache HIT para ${city.name} - Retornando dados cacheados`
      );

      if (request.userId) {
        this.createSearchHistoryAsync(
          request.userId,
          city.id,
          city.name,
          city.state,
          request.startDate,
          request.endDate
        );
      }
      const responseData = this.normalizeCachedData(
        cachedResponse.cachedResponse.responseData
      );
      return this.buildClientResponse(city, responseData, true);
    }

    console.log(
      `[SearchDestination] ❌ Cache MISS - Buscando dados nas APIs...`
    );

    const fetchedData = await this.fetchAllCityData({
      city,
      startDate: request.startDate,
      endDate: request.endDate,
      forecastDays: request.forecastDays ?? 5,
      targetMonth: request.targetMonth,
      includeForecast: request.includeForecast ?? true,
      includeSeasonal: request.includeSeasonal ?? false,
      origin: request.origin,
    });
    const start = request.startDate || new Date();
    const end =
      request.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const guideText = await this.generateGuideTextWithLLM({
      cityName: city.name,
      state: city.state,
      country: 'Brasil',
      cityInfo:
        fetchedData.wikipediaResponse?.pageInfo?.extract ||
        fetchedData.wikipediaResponse?.summary?.extract ||
        `Informações sobre a cidade: ${city.name}`,

      weather: fetchedData.weatherResponse
        ? {
            current: fetchedData.weatherResponse.current
              ? {
                  temperature: fetchedData.weatherResponse.current.temperature,
                  condition: fetchedData.weatherResponse.current.condition,
                  description: fetchedData.weatherResponse.current.description,
                  humidity: fetchedData.weatherResponse.current.humidity,
                }
              : undefined,
            forecast: fetchedData.weatherResponse.forecast?.map((f) => ({
              date: f.date,
              temperature: f.temperature,
              condition: f.condition,
            })),
            seasonal: fetchedData.weatherResponse.seasonal
              ? {
                  season: fetchedData.weatherResponse.seasonal.season,
                  averageTemperature:
                    fetchedData.weatherResponse.seasonal.averageTemperature,
                  description: fetchedData.weatherResponse.seasonal.description,
                }
              : undefined,
          }
        : undefined,

      costs: fetchedData.costsResponse
        ? {
            transport: {
              bus: fetchedData.costsResponse.data.transport?.bus,
              flight: fetchedData.costsResponse.data.transport?.flight,
            },
            accommodation: {
              budget: fetchedData.costsResponse.data.accommodation?.budget,
              midRange: fetchedData.costsResponse.data.accommodation?.midRange,
              luxury: fetchedData.costsResponse.data.accommodation?.luxury,
            },
            currency: 'BRL',
          }
        : undefined,

      travelInfo: {
        startDate: start,
        endDate: end,
        origin: request.origin,
        numberOfNights: this.calculateNights(start, end),
      },
    });

    const cacheData = await this.buildCacheData(
      city.name,
      fetchedData,
      guideText
    );

    const shouldCache =
      city.requestCount >= this.POPULAR_CITY_THRESHOLD || city.isPopular;

    if (shouldCache) {
      console.log(
        `[SearchDestination] 🔥 Cidade popular (${city.requestCount} requests) - Salvando em cache...`
      );

      this.saveToCacheAsync(city.id, cacheData);
    } else {
      console.log(
        `[SearchDestination] ⚠️ Cidade não popular (${city.requestCount} requests) - Cache não salvo`
      );
    }

    if (request.userId) {
      this.createSearchHistoryAsync(
        request.userId,
        city.id,
        city.name,
        city.state,
        request.startDate,
        request.endDate
      );
    }

    console.log(
      `[SearchDestination] ✅ Processamento concluído para ${city.name}`
    );

    return this.buildClientResponse(city, cacheData, false);
  }

  //Metodos
  private async getOrCreateCity(
    slug: string,
    cityName: string,
    state: string
  ): Promise<CityResponseDTO> {
    try {
      if (!isValidSlug(slug)) {
        throw new Error(`Slug inválido: ${slug}`);
      }
      const result = await this.deps.getCityUseCase.execute({ slug });
      return result.city;
    } catch (_) {
      console.log(
        `[SearchDestination] Cidade "${cityName}" não encontrada. Criando...`
      );

      const newCity = await this.deps.createCityUseCase.execute({
        name: cityName,
        state,
        country: 'Brasil',
      });

      return newCity.city;
    }
  }
  private updateCityPopularityAsync(
    cityId: string
  ): Promise<UpdateCityPopularityOutput | null> {
    return this.deps.updateCityPopularityUseCase
      .execute({
        cityId,
      })
      .then((result) => {
        console.log(`Popularidade da cidade ${cityId} atualizada com sucesso!`);
        return result;
      })
      .catch((error) => {
        console.error(
          `[SearchDestination] Erro ao atualizar popularidade da cidade ${cityId}: `,
          error
        );
        return null;
      });
  }

  //cached
  private async getCachedData(
    cityId: string
  ): Promise<GetCachedResponseOutput | null> {
    try {
      const result = await this.deps.getCachedResponseUseCase.execute({
        cityId,
      });

      if (!result.cachedResponse || result.isExpired) {
        return null;
      }

      return result;
    } catch (error) {
      console.warn('[SearchDestination] Erro ao buscar cache:', error);
      return null;
    }
  }

  private saveToCacheAsync(cityId: string, data: CachedResponseData): void {
    this.deps.saveCachedResponseUseCase
      .execute({
        cityId,
        responseData: data,
        ttlInDays: this.CACHE_TTL_DAYS,
      })
      .then((result) => {
        console.log(
          `[SearchDestination] ✅ Cache salvo com sucesso (expira em: ${result.expiresAt})`
        );
      })
      .catch((error) => {
        console.error('[SearchDestination] ❌ Erro ao salvar cache:', error);
      });
  }

  private normalizeCachedData(
    cachedData: CachedResponseRaw
  ): CachedResponseData {
    return {
      cityInfo: cachedData.cityInfo || '',
      generatedText: cachedData.generatedText,
      generatedAt: cachedData.generatedAt
        ? new Date(cachedData.generatedAt)
        : new Date(),
      hotels: cachedData.hotels || [],

      weatherInfo: cachedData.weatherInfo
        ? {
            current: cachedData.weatherInfo.current
              ? {
                  temperature: cachedData.weatherInfo.current.temperature ?? 0,
                  temperatureMin: cachedData.weatherInfo.current.temperatureMin,
                  temperatureMax: cachedData.weatherInfo.current.temperatureMax,
                  feelsLike: cachedData.weatherInfo.current.feelsLike,
                  condition:
                    cachedData.weatherInfo.current.condition ?? 'Unknown',
                  description: cachedData.weatherInfo.current.description ?? '',
                  humidity: cachedData.weatherInfo.current.humidity ?? 0,
                  windSpeed: cachedData.weatherInfo.current.windSpeed ?? 0,
                  pressure: cachedData.weatherInfo.current.pressure ?? 0,
                  cloudiness: cachedData.weatherInfo.current.cloudiness,
                  visibility: cachedData.weatherInfo.current.visibility,
                  timestamp: cachedData.weatherInfo.current.timestamp
                    ? new Date(cachedData.weatherInfo.current.timestamp)
                    : new Date(),
                }
              : undefined,

            forecast: cachedData.weatherInfo.forecast
              ?.filter((f) => f.date !== undefined && f.date !== null)
              .map((f) => ({
                date: new Date(f.date!),
                temperature: f.temperature ?? 0,
                temperatureMin: f.temperatureMin ?? 0,
                temperatureMax: f.temperatureMax ?? 0,
                condition: f.condition ?? 'Unknown',
                description: f.description ?? '',
                humidity: f.humidity ?? 0,
                chanceOfRain: f.chanceOfRain,
              })),

            seasonal: cachedData.weatherInfo.seasonal
              ? {
                  season: this.validateSeason(
                    cachedData.weatherInfo.seasonal.season
                  ),
                  averageTemperature:
                    cachedData.weatherInfo.seasonal.averageTemperature,
                  averageRainfall:
                    cachedData.weatherInfo.seasonal.averageRainfall ?? 0,
                  description:
                    cachedData.weatherInfo.seasonal.description ?? '',
                }
              : undefined,
          }
        : undefined,

      costsTotal: cachedData.costsTotal
        ? {
            accommodation: cachedData.costsTotal.accommodation,
            transport: cachedData.costsTotal.transport,
            estimateDailyBudget: cachedData.costsTotal.estimateDailyBudget,
            totalEstimate: cachedData.costsTotal.totalEstimate,
            costsSources: cachedData.costsTotal.costsSources as CostsSource,
          }
        : undefined,
    };
  }

  //apis Fetch
  private async fetchAllCityData(params: {
    city: CityResponseDTO;
    startDate?: Date;
    endDate?: Date;
    forecastDays: number;
    targetMonth?: number;
    includeForecast: boolean;
    includeSeasonal: boolean;
    origin: string;
  }): Promise<IFetchedCityData> {
    let coordsIntance: Coordinates | undefined = undefined;
    if (params.city.coordinates) {
      coordsIntance = Coordinates.create(
        params.city.coordinates.latitude,
        params.city.coordinates.longitude
      );
    }

    const [wikipediaResult, weatherResult, costsResult] =
      await Promise.allSettled([
        this.fetchWikipediaInfo(
          params.city.name,
          params.city.state,
          params.city.country
        ),
        this.fetchWeatherInfo(
          coordsIntance,
          params.city.name,
          params.forecastDays,
          params.targetMonth,
          params.includeForecast,
          params.includeSeasonal
        ),
        this.fetchCostsInfo(
          params.origin,
          params.city.name,
          params.startDate,
          params.endDate,
          coordsIntance
        ),
      ]);

    return {
      wikipediaResponse: this.extractResult(wikipediaResult, 'Wikipedia'),
      weatherResponse: this.extractResult(weatherResult, 'Weather'),
      costsResponse: this.extractResult(costsResult, 'Costs'),
    };
  }

  private async fetchWikipediaInfo(
    cityName: string,
    state?: string,
    country?: string,
    includeSearch?: boolean,
    includeSummary?: boolean
  ): Promise<WikipediaOrchestratorOutput | null> {
    try {
      const inputFetch: WikipediaOrchestratorInput = {
        cityName,
        state,
        country,
        includeSearch,
        includeSummary,
      };

      return await this.deps.wikipediaOrchestrator.execute(inputFetch);
    } catch (error) {
      console.log(
        `[SearchDestination] Erro ao buscar informações de ${cityName}:`,
        error
      );
      return null;
    }
  }

  private async fetchWeatherInfo(
    coordinates?: Coordinates,
    cityName?: string,
    forecastDays?: number,
    targetMonth?: number,
    includeForecast?: boolean,
    includeSeasonal?: boolean
  ): Promise<WeatherOrchestratorOutput | null> {
    try {
      if (!cityName && !coordinates) {
        throw new Error('Nome de cidade ou Coordenadas deve ser fornecido');
      }

      const inputFetch: WeatherOrchestratorInput = {
        cityName,
        coordinates,
        forecastDays: forecastDays ?? 3,
        targetMonth: targetMonth ?? 1,
        includeForecast: includeForecast ?? true,
        includeSeasonal: includeSeasonal ?? false,
      };

      return this.deps.weatherOrchestrator.execute(inputFetch);
    } catch (error) {
      console.log(
        `[SearchDestination] Erro ao buscar informações do Clima de ${cityName}:`,
        error
      );
      return null;
    }
  }

  private async fetchCostsInfo(
    origin: string,
    destination: string,
    startDate?: Date,
    endDate?: Date,
    destinationCoordinates?: Coordinates
  ): Promise<CostsServiceOutput | null> {
    try {
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const inputFetch: CostsServiceInput = {
        origin,
        destination,
        startDate: start,
        endDate: end,
        destinationCoordinates,
        includeHotelsList: true,
        hotelsLimit: 20,
      };

      return await this.deps.costsOrchestrator.execute(inputFetch);
    } catch (error) {
      console.log(
        `[SearchDestination] Erro ao buscar informações de custo de ${origin} para ${destination}:`,
        error
      );
      return null;
    }
  }

  //LLM

  private async generateGuideTextWithLLM(
    input: GenerateTravelGuideInput
  ): Promise<string> {
    try {
      console.log('[SearchDestination] Gerando texto com LLM...');

      const result = await this.deps.llmService.generateTravelGuide(input);

      return result.text;
    } catch (error) {
      console.error(
        '[SearchDestination] Erro ao gerar texto com LLM. Usando fallback...',
        error
      );

      return this.generateFallbackText(
        input.cityName,
        input.cityInfo ??
          `A cidade de ${input.cityName} tem das paisagens mais belas do pais, sendo um dos principais pontos turísticos do seu estado`,
        input.weather
          ? {
              current: {
                temperature: 25,
                condition: 'Ensolarado',
                description: 'Céu claro e sem nuvens',
                humidity: 60,
              },
              forecast: [
                {
                  date: new Date(Date.now() + 86400000),
                  temperature: 28,
                  condition: 'Parcialmente Nublado',
                },
                {
                  date: new Date(Date.now() + 2 * 86400000),
                  temperature: 26,
                  condition: 'Chuva Leve',
                },
                {
                  date: new Date(Date.now() + 3 * 86400000),
                  temperature: 29,
                  condition: 'Ensolarado',
                },
              ],
              seasonal: {
                season: 'Verão',
                averageTemperature: 27,
                description: 'Estação quente e úmida.',
              },
            }
          : undefined,
        input.costs
          ? {
              transport: {
                bus: {
                  min: 50,
                  max: 200,
                },
                flight: {
                  min: 300,
                  max: 1500,
                },
              },
              accommodation: {
                budget: {
                  min: 80,
                  max: 150,
                },
                midRange: {
                  min: 180,
                  max: 350,
                },
                luxury: {
                  min: 400,
                  max: 800,
                },
              },
              currency: 'BRL',
            }
          : undefined
      );
    }
  }

  private generateFallbackText(
    cityName: string,
    wikipedia: string | null,
    weather?: {
      current?: {
        temperature: number;
        condition: string;
        description?: string;
        humidity?: number;
      };
      forecast?: Array<{
        date: Date;
        temperature: number;
        condition: string;
      }>;
      seasonal?: {
        season: string;
        averageTemperature: number;
        description?: string;
      };
    },
    costs?: {
      transport?: {
        bus?: { min?: number; max?: number };
        flight?: { min?: number; max?: number };
      };
      accommodation?: {
        budget?: { min?: number; max?: number };
        midRange?: { min?: number; max?: number };
        luxury?: { min?: number; max?: number };
      };
      currency?: string;
    }
  ): string {
    let text = `# Guia de Viagem para ${cityName}\n\n`;

    if (wikipedia) {
      text += `## Sobre ${cityName}\n\n`;
      text += `${wikipedia.substring(0, 400)}...\n\n`;
    }

    if (weather?.current) {
      text += `## Clima Atual\n\n`;
      text += `Temperatura: ${weather.current.temperature}°C`;
      if (weather.current.humidity) {
        text += ` | Umidade: ${weather.current.humidity}%`;
      }
      text += `\n`;
      text += `Condição: ${weather.current.condition}`;
      if (weather.current.description) {
        text += ` - ${weather.current.description}`;
      }
      text += `\n\n`;
    }

    if (weather?.forecast && weather.forecast.length > 0) {
      text += `## Previsão dos Próximos Dias\n\n`;
      weather.forecast.slice(0, 3).forEach((day) => {
        const date = new Date(day.date).toLocaleDateString('pt-BR');
        text += `- ${date}: ${day.temperature}°C, ${day.condition}\n`;
      });
      text += '\n';
    }

    if (costs) {
      text += `## Estimativa de Custos\n\n`;
      const currency = costs.currency || 'BRL';

      if (costs.transport?.flight) {
        text += `Passagem Aérea: ${currency} ${costs.transport.flight.min} - ${currency} ${costs.transport.flight.max}\n`;
      }

      if (costs.transport?.bus) {
        text += `Ônibus: ${currency} ${costs.transport.bus.min} - ${currency} ${costs.transport.bus.max}\n`;
      }

      if (costs.accommodation) {
        text += `\nHospedagem (por noite):\n`;
        if (costs.accommodation.budget) {
          text += `- Econômica: ${currency} ${costs.accommodation.budget.min} - ${currency} ${costs.accommodation.budget.max}\n`;
        }
        if (costs.accommodation.midRange) {
          text += `- Intermediária: ${currency} ${costs.accommodation.midRange.min} - ${currency} ${costs.accommodation.midRange.max}\n`;
        }
        if (costs.accommodation.luxury) {
          text += `- Luxo: ${currency} ${costs.accommodation.luxury.min} - ${currency} ${costs.accommodation.luxury.max}\n`;
        }
      }

      text += '\n';
    }

    text += `\n---\n\n`;

    return text;
  }

  //builds
  private async buildCacheData(
    cityName: string,
    fetchedData: IFetchedCityData,
    generatedText: string
  ): Promise<CachedResponseData> {
    const { wikipediaResponse, weatherResponse, costsResponse } = fetchedData;

    const weatherInfo: WeatherInfo = {
      current: weatherResponse?.current
        ? { ...weatherResponse.current }
        : undefined,
      forecast: weatherResponse?.forecast?.map((f) => ({
        date: new Date(f.date),
        temperature: f.temperature,
        temperatureMin: f.temperatureMin,
        temperatureMax: f.temperatureMax,
        condition: f.condition,
        description: f.description,
        humidity: f.humidity,
        chanceOfRain: f.chanceOfRain,
      })),
      seasonal: weatherResponse?.seasonal
        ? {
            season: weatherResponse.seasonal.season as season,
            averageTemperature: weatherResponse.seasonal.averageTemperature,
            averageRainfall: weatherResponse.seasonal.averageRainfall,
            description: weatherResponse.seasonal.description,
          }
        : undefined,
    };
    const costsTotal = {
      accommodation: {
        budgetMin: costsResponse?.data.accommodation?.budget?.min,
        budgetMax: costsResponse?.data.accommodation?.budget?.max,
        midRangeMin: costsResponse?.data.accommodation?.midRange?.min,
        midRangeMax: costsResponse?.data.accommodation?.midRange?.max,
        luxuryMin: costsResponse?.data.accommodation?.luxury?.min,
        luxuryMax: costsResponse?.data.accommodation?.luxury?.max,
      },
      transport: {
        busMin: costsResponse?.data.transport?.bus?.min,
        busMax: costsResponse?.data.transport?.bus?.max,
        flightMin: costsResponse?.data.transport?.flight?.min,
        flightMax: costsResponse?.data.transport?.flight?.max,
      },
      estimateDailyBugdet: {
        bugdet: costsResponse?.data.estimateDailyBudget?.budget,
        midRange: costsResponse?.data.estimateDailyBudget?.midRange,
        luxury: costsResponse?.data.estimateDailyBudget?.luxury,
      },
      totalEstimate: {
        min: costsResponse?.data.totalEstimate?.min,
        max: costsResponse?.data.totalEstimate?.max,
      },
      costsSources: {
        transport:
          costsResponse?.sources.transport === 'api'
            ? transportEnum.api
            : transportEnum.estimated,
        accommodation:
          costsResponse?.sources.accommodation === 'api'
            ? accommodationEnum.api
            : accommodationEnum.estimated,
      },
    };
    return {
      cityInfo:
        wikipediaResponse?.pageInfo?.extract ||
        wikipediaResponse?.summary?.extract ||
        `Informações sobre ${cityName}`,
      weatherInfo,
      costsTotal,
      generatedText,
      generatedAt: new Date(),
      hotels: costsResponse?.hotels?.hotels || [],
    };
  }

  private buildClientResponse(
    city: CityResponseDTO,
    data: CachedResponseData,
    fromCache: boolean
  ): DestinationInfoResponseDTO {
    return {
      cityInfo: {
        description: data.cityInfo || `Informações sobre ${city.name}`,
        summary: data.cityInfo,
        extractedAt: data.generatedAt,
      },

      city: {
        id: city.id,
        name: city.name,
        state: city.state,
        country: city.country,
        slug: city.slug,
        coordinates: city.coordinates,
        requestCount: city.requestCount,
        isPopular: city.isPopular,
      },

      textGenerated: data.generatedText || '',

      weather: data.weatherInfo
        ? {
            current: data.weatherInfo.current,
            forecast: data.weatherInfo.forecast,
            seasonal: data.weatherInfo.seasonal,
          }
        : undefined,

      costs: data.costsTotal
        ? {
            currency: 'BRL',
            transport: {
              bus:
                data.costsTotal.transport?.busMin &&
                data.costsTotal.transport?.busMax
                  ? {
                      min: data.costsTotal.transport.busMin,
                      max: data.costsTotal.transport.busMax,
                    }
                  : undefined,
              flight:
                data.costsTotal.transport?.flightMin &&
                data.costsTotal.transport?.flightMax
                  ? {
                      min: data.costsTotal.transport.flightMin,
                      max: data.costsTotal.transport.flightMax,
                    }
                  : undefined,
              currency: 'BRL',
            },
            accommodation: {
              budget:
                data.costsTotal.accommodation?.budgetMin &&
                data.costsTotal.accommodation?.budgetMax
                  ? {
                      min: data.costsTotal.accommodation.budgetMin,
                      max: data.costsTotal.accommodation.budgetMax,
                    }
                  : undefined,
              midRange:
                data.costsTotal.accommodation?.midRangeMin &&
                data.costsTotal.accommodation?.midRangeMax
                  ? {
                      min: data.costsTotal.accommodation.midRangeMin,
                      max: data.costsTotal.accommodation.midRangeMax,
                    }
                  : undefined,
              luxury:
                data.costsTotal.accommodation?.luxuryMin &&
                data.costsTotal.accommodation?.luxuryMax
                  ? {
                      min: data.costsTotal.accommodation.luxuryMin,
                      max: data.costsTotal.accommodation.luxuryMax,
                    }
                  : undefined,
              currency: 'BRL',
            },
            estimateDailyBudget: data.costsTotal.estimateDailyBudget,
            totalEstimate: data.costsTotal.totalEstimate,
          }
        : undefined,

      hotels: data.hotels || [],

      cache: {
        cached: fromCache,
        cachedAt: fromCache ? data.generatedAt : undefined,
        source: fromCache ? 'redis' : 'fresh',
      },

      metadata: {
        generatedAt: data.generatedAt || new Date(),
      },

      sources: [
        {
          name: 'Wikipedia',
          type: 'api',
          accessedAt: data.generatedAt,
        },
        ...(data.weatherInfo?.current
          ? [
              {
                name: 'Weather API',
                type: 'api' as const,
                accessedAt: data.generatedAt,
              },
            ]
          : []),
        ...(data.costsTotal
          ? [
              {
                name: 'Costs API',
                type: 'api' as const,
                accessedAt: data.generatedAt,
              },
            ]
          : []),
      ],
    };
  }

  private createSearchHistoryAsync(
    userId: string,
    cityId: string,
    cityName: string,
    state: string,
    startDate?: Date,
    endDate?: Date
  ): void {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const createInput: CreateSearchHistoryInput = {
      cityId,
      cityName,
      state,
      country: 'Brasil',
      userId,
      travelStartDate: start,
      travelEndDate: end,
    };
    this.deps.createSearchHistoryUseCase
      .execute(createInput)
      .then(() => {
        console.log('[SearchDestination] Busca registrada no histórico');
      })
      .catch((error) => {
        console.error(
          '[SearchDestination] Erro ao registrar histórico:',
          error
        );
      });
  }

  //Helpers

  private validateSeason(seasonStr: string): season {
    const validSeasons: season[] = [
      season.summer,
      season.autumn,
      season.winter,
      season.spring,
    ];

    const normalized = seasonStr.toLowerCase() as season;

    if (validSeasons.includes(normalized)) {
      return normalized;
    }

    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) return season.summer;
    if (month >= 2 && month <= 4) return season.autumn;
    if (month >= 5 && month <= 7) return season.winter;
    return season.spring;
  }

  private extractResult<T>(
    result: PromiseSettledResult<T>,
    serviceName: string
  ): T | null {
    if (result.status === 'fulfilled') {
      const value = result.value;
      const hasValue = value !== null && value !== undefined;

      console.log(
        `[SearchDestination] ${serviceName} - ${hasValue ? 'sucesso' : 'null'}`
      );

      return value;
    }

    console.error(
      `[SearchDestination] ${serviceName} - ❌ falha:`,
      result.reason
    );
    return null;
  }

  protected calculateNights(chekIn: Date, checkout: Date): number {
    const diffTime = Math.abs(checkout.getTime() - chekIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
