import { FastifySchema } from 'fastify';
import { commonResponses, successSchema } from './common.schemas';
import { generateSchema } from '@anatine/zod-openapi';
import {
  CreateUserDTOSchema,
  UpdateUserDTOSchema,
  UserResponseDTOSchema,
} from '@/core/src/dtos';

export const getUserProfileSchema: FastifySchema = {
  description: 'Obter perfil do usuário autenticado',
  summary: 'Meu perfil',
  tags: ['User'] as const,
  security: [
    {
      bearerAuth: [],
    },
  ] as const,
  response: {
    200: {
      description: 'Perfil retornado com sucesso',
      content: {
        'application/json': {
          schema: successSchema(generateSchema(UserResponseDTOSchema)),
        },
      },
    },
    ...commonResponses,
  },
};

export const createUserProfileSchema: FastifySchema = {
  description: 'Criar perfil do usuário',
  summary: 'Criar perfil',
  tags: ['User'] as const,
  security: [
    {
      bearerAuth: [],
    },
  ] as const,
  body: generateSchema(CreateUserDTOSchema),
  response: {
    201: {
      description: 'Perfil criado com sucesso',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: generateSchema(UserResponseDTOSchema),
      },
      required: ['success', 'data'],
    },
    ...commonResponses,
  },
};

export const updateUserProfileSchema: FastifySchema = {
  description: 'Atualizar perfil do usuário',
  summary: 'Atualizar perfil',
  tags: ['User'] as const,
  security: [
    {
      bearerAuth: [],
    },
  ] as const,
  body: generateSchema(UpdateUserDTOSchema),
  response: {
    200: {
      description: 'Perfil atualizado com sucesso',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: generateSchema(UserResponseDTOSchema),
      },
      required: ['success', 'data'],
    },
    ...commonResponses,
  },
};

export const deleteUserAccountSchema: FastifySchema = {
  description: 'Deletar conta do usuário',
  summary: 'Deletar conta',
  tags: ['User'] as const,
  security: [
    {
      bearerAuth: [],
    },
  ] as const,
  response: {
    204: {
      description: 'Conta deletada com sucesso',
      type: 'null',
    },
    ...commonResponses,
  },
};

export const getUserHistorySchema: FastifySchema = {
  description: 'Obter histórico de buscas do usuário',
  summary: 'Histórico de buscas',
  tags: ['User'] as const,
  security: [
    {
      bearerAuth: [],
    },
  ] as const,
  response: {
    200: {
      description: 'Histórico retornado com sucesso',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
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
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
          required: ['searches', 'total', 'limit', 'offset'],
        },
      },
      required: ['success', 'data'],
    },
    ...commonResponses,
  },
};
