import { generateSchema } from '@anatine/zod-openapi';
import { GetDestinationInfoDTOSchema } from '../../../dtos/requests/search/GetDestinationInfoDTO';
import { commonResponses, successSchema } from './common.schemas';
import { FastifySchema } from '../contracts/types/schema';
import { DestinationInfoResponseDTOSchema } from '@/core/src/dtos';

export const searchDestinationSchema: FastifySchema = {
  description: `
Busca informações completas sobre um destino turístico.

**Fluxo:**
1. Sistema verifica se cidade existe no cache
2. Se existir cache e cidade for popular → retorna cache
3. Se não houver cache → busca em APIs externas (Wikipedia, Weather, Costs)
4. Gera texto com IA (recomendações personalizadas)
5. Salva no cache se cidade for popular (>10 buscas)
6. Registra no histórico (se usuário autenticado)

**Cache:**
- Cidades populares têm dados cacheados por 3 dias
- Resposta indica se veio do cache (\`cache.cached = true\`)

**Autenticação:**
- Opcional: se autenticado, registra no histórico
- Sem autenticação: funciona normalmente, mas sem histórico
  `,
  tags: ['Search'],
  summary: 'Buscar destino',
  body: generateSchema(GetDestinationInfoDTOSchema),
  response: {
    200: {
      description: 'Informações do destino retornadas com sucesso',
      content: {
        'application/json': {
          schema: successSchema(
            generateSchema(DestinationInfoResponseDTOSchema)
          ),
          example: {
            success: true,
            data: {
              city: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Rio de Janeiro',
                state: 'RJ',
                country: 'Brasil',
                slug: 'rio-de-janeiro-rj',
                coordinates: {
                  latitude: -22.9068,
                  longitude: -43.1729,
                },
                requestCount: 1547,
                isPopular: true,
              },
              cityInfo: {
                description: 'Rio de Janeiro é uma cidade...',
                summary: 'Conhecida por suas praias...',
                extractedAt: '2024-01-20T14:30:00Z',
              },
              textGenerated: '# Guia de Viagem para Rio de Janeiro\n\n...',
              weather: {
                current: {
                  temperature: 28,
                  condition: 'Ensolarado',
                  description: 'Céu claro',
                  humidity: 65,
                },
              },
              costs: {
                currency: 'BRL',
                transport: {
                  flight: { min: 300, max: 1200 },
                },
                accommodation: {
                  budget: { min: 80, max: 150 },
                  midRange: { min: 200, max: 400 },
                },
              },
              cache: {
                cached: true,
                cachedAt: '2024-01-20T10:00:00Z',
                source: 'redis',
              },
            },
          },
        },
      },
    },
    ...commonResponses,
  },
};

export const getPopularDestinationsSchema: FastifySchema = {
  description: 'Lista as cidades mais buscadas',
  tags: ['Search'],
  summary: 'Cidades populares',
  response: {
    200: {
      description: 'Lista de cidades populares',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              cities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    state: { type: 'string' },
                    slug: { type: 'string' },
                    requestCount: { type: 'integer' },
                    isPopular: { type: 'boolean' },
                  },
                },
              },
            },
          }),
        },
      },
    },
    ...commonResponses,
  },
};
