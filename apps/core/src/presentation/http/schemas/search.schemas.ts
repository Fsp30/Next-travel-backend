import { GetDestinationInfoDTOSchema } from '../../../dtos/requests/search/GetDestinationInfoDTO';
import { commonResponses, successSchema } from './common.schemas';
import { DestinationInfoResponseDTOSchema } from '@/core/src/dtos';
import { generateSchema } from '@anatine/zod-openapi';
import { FastifySchema } from 'fastify';

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
  summary: 'Buscar destino',
  tags: ['Search'] as const,
  body: generateSchema(GetDestinationInfoDTOSchema),
  response: {
    200: {
      description: 'Informações do destino retornadas com sucesso',
      content: {
        'application/json': {
          schema: successSchema(
            generateSchema(DestinationInfoResponseDTOSchema)
          ),
        },
      },
    },
    ...commonResponses,
  },
};

export const getPopularDestinationsSchema: FastifySchema = {
  description: 'Lista as cidades mais buscadas',
  summary: 'Cidades populares',
  tags: ['Search'] as const,
  response: {
    200: {
      description: 'Lista de cidades populares',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              cities: { type: 'array', items: { type: 'object' } },
            },
          }),
        },
      },
    },
    ...commonResponses,
  },
};
