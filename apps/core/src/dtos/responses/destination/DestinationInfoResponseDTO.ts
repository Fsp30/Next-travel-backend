import { z } from 'zod';
import { CityResponseDTOSchema } from './CityResponseDTO';
import { WeatherInfoDTOSchema } from './WeatherInfoDTO';
import { CostEstimateDTOSchema } from './CostEstimateDTO';

/**
 * DTO de resposta completo com informações sobre um destino turístico
 *
 * Inclui:
 * - Dados básicos da cidade
 * - Informações da Wikipedia
 * - Previsão/informações de clima
 * - Estimativas de custos
 * - Recomendações (futuro com LLM)
 *
 * @example
 * ```typescript
 * const response: DestinationInfoResponseDTO = {
 *   city: { id: '...', name: 'Rio de Janeiro', ... },
 *   cityInfo: {
 *     description: 'Rio de Janeiro é...',
 *     summary: 'Cidade maravilhosa...',
 *     pageUrl: 'https://pt.wikipedia.org/wiki/Rio_de_Janeiro'
 *   },
 *   weather: { temperature: 28, ... },
 *   costs: { transport: {...}, accommodation: {...} },
 *   sources: [{ name: 'Wikipedia', url: '...' }]
 * };
 * ```
 */
export const DestinationInfoResponseDTOSchema = z.object({
  // Informações básicas da cidade
  city: CityResponseDTOSchema,

  // Informações gerais (Wikipedia)
  cityInfo: z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    summary: z.string().optional(),
    pageUrl: z.url('URL da página inválida').optional(),
    thumbnailUrl: z.url('URL da thumbnail inválida').optional(),
    extractedAt: z.date().optional(), // Quando foi extraído
  }),

  // Informações de clima (OpenWeatherMap)
  weather: WeatherInfoDTOSchema.optional(),

  // Estimativas de custos
  costs: CostEstimateDTOSchema.optional(),

  // Informações sobre a viagem planejada
  travelInfo: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      durationDays: z
        .number()
        .int()
        .positive('Duração deve ser positiva')
        .optional(),
    })
    .optional(),

  // Recomendações geradas por LLM (futuro)
  recommendations: z
    .object({
      text: z.string(), // Texto completo gerado
      highlights: z.array(z.string()).optional(), // Pontos principais
      tips: z.array(z.string()).optional(), // Dicas práticas
      generatedAt: z.date().optional(),
    })
    .optional(),

  // Metadados de cache
  cache: z
    .object({
      cached: z.boolean(), // Se veio do cache
      cachedAt: z.date().optional(), // Quando foi cacheado
      expiresAt: z.date().optional(), // Quando expira
      source: z.enum(['redis', 'fresh']).optional(), // Origem dos dados
    })
    .optional(),

  // Fontes de informação
  sources: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['api', 'database', 'cache']).optional(),
        url: z.url().optional(),
        accessedAt: z.date().optional(),
      })
    )
    .optional(),

  // Metadados da resposta
  metadata: z
    .object({
      generatedAt: z.date(),
      processingTimeMs: z.number().optional(),
      apiCallsCount: z.number().int().optional(),
    })
    .optional(),
});

export type DestinationInfoResponseDTO = z.infer<
  typeof DestinationInfoResponseDTOSchema
>;

/**
 * Valida resposta de destino
 * @throws {ZodError} Se os dados não passarem na validação
 */
export function validateDestinationInfoResponseDTO(
  data: unknown
): DestinationInfoResponseDTO {
  return DestinationInfoResponseDTOSchema.parse(data);
}

/**
 * Validação "safe" que não lança erro
 */
export function safeValidateDestinationInfoResponseDTO(data: unknown) {
  return DestinationInfoResponseDTOSchema.safeParse(data);
}

/**
 * Helper: Criar resposta vazia/parcial
 */
export function createPartialDestinationInfo(
  city: z.infer<typeof CityResponseDTOSchema>,
  cityInfo: { description: string; summary?: string; pageUrl?: string }
): Partial<DestinationInfoResponseDTO> {
  return {
    city,
    cityInfo,
    metadata: {
      generatedAt: new Date(),
    },
  };
}
