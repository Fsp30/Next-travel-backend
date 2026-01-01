import { CreateUserDTOSchema, UpdateUserDTOSchema } from '@/core/src/dtos';
import { FastifySchema } from '../contracts/types/schema';
import { commonResponses, securityAuth, successSchema } from './common.schemas';
import { generateSchema } from '@anatine/zod-openapi';
import { UserResponseDTOSchema } from '../../../dtos/responses/user/UserResponseDTO';

export const getUserProfileSchema: FastifySchema = {
  description: 'Obter perfil do usuário autenticado',
  tags: ['User'],
  summary: 'Meu perfil',
  security: securityAuth,
  body: generateSchema(CreateUserDTOSchema),
  response: {
    200: {
      description: 'Perfil retornado com sucesso',
      content: {
        'application/json': {
          schema: successSchema(generateSchema(UserResponseDTOSchema)),
          example: {
            success: true,
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              email: 'user@example.com',
              name: 'João Silva',
              profilePicture: 'https://lh3.googleusercontent.com/...',
              createdAt: '2024-01-15T10:30:00Z',
              lastLogin: '2024-01-20T14:22:00Z',
            },
          },
        },
      },
    },
    ...commonResponses,
  },
};

export const updateUserProfileSchema: FastifySchema = {
  description: 'Atualizar perfil do usuário',
  tags: ['User'],
  summary: 'Atualizar perfil',
  security: securityAuth,
  body: generateSchema(UpdateUserDTOSchema),
  response: {
    200: {
      description: 'Perfil atualizado com sucesso',
      content: {
        'application/json': {
          schema: successSchema(generateSchema(UserResponseDTOSchema)),
        },
      },
    },
    ...commonResponses,
  },
};

export const deleteUserAccountSchema: FastifySchema = {
  description: 'Deletar conta do usuário',
  tags: ['User'],
  summary: 'Deletar conta',
  security: securityAuth,
  response: {
    204: {
      description: 'Conta deletada com sucesso',
    },
    ...commonResponses,
  },
};

export const getUserHistorySchema: FastifySchema = {
  description: 'Obter histórico de buscas do usuário',
  tags: ['User'],
  summary: 'Histórico de buscas',
  security: securityAuth,
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        default: 10,
        minimum: 1,
        maximum: 50,
        description: 'Número de resultados por página',
      },
      offset: {
        type: 'integer',
        default: 0,
        minimum: 0,
        description: 'Deslocamento para paginação',
      },
    },
  },
  response: {
    200: {
      description: 'Histórico retornado com sucesso',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              searches: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    cityName: { type: 'string' },
                    state: { type: 'string' },
                    travelStartDate: {
                      type: 'string',
                      format: 'date',
                      nullable: true,
                    },
                    travelEndDate: {
                      type: 'string',
                      format: 'date',
                      nullable: true,
                    },
                    searchDate: { type: 'string', format: 'date-time' },
                  },
                },
              },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
            },
          }),
        },
      },
    },
    ...commonResponses,
  },
};
