import { generateSchema } from '@anatine/zod-openapi';
import { AuthenticateUserDTOSchema } from '../../../dtos/requests/auth/AuthenticateUserDTO';
import { commonResponses, securityAuth, successSchema } from './common.schemas';
import { FastifySchema } from '../contracts/types/schema';

export const loginGoogleSchema: FastifySchema = {
  description: 'Autenticação via Google OAuth',
  tags: ['Auth'],
  summary: 'Login com Google',
  body: generateSchema(AuthenticateUserDTOSchema),
  response: {
    200: {
      description: 'Login realizado com sucesso',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  profilePicture: {
                    type: 'string',
                    format: 'uri',
                    nullable: true,
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  lastLogin: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                  },
                },
              },
              accessToken: {
                type: 'string',
                description: 'JWT token válido por 7 dias',
              },
              refreshToken: {
                type: 'string',
                description:
                  'Token para renovar o accessToken (válido por 30 dias)',
              },
            },
          }),
          example: {
            success: true,
            data: {
              user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'user@example.com',
                name: 'João Silva',
                profilePicture: 'https://lh3.googleusercontent.com/...',
                createdAt: '2024-01-15T10:30:00Z',
                lastLogin: '2024-01-20T14:22:00Z',
              },
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    },
    ...commonResponses,
  },
};

export const refreshTokenSchema: FastifySchema = {
  description: 'Renovar access token usando refresh token',
  tags: ['Auth'],
  summary: 'Refresh token',
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'Refresh token obtido no login',
      },
    },
  },
  response: {
    200: {
      description: 'Token renovado com sucesso',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          }),
        },
      },
    },
    ...commonResponses,
  },
};

export const logoutSchema: FastifySchema = {
  description: 'Realizar logout',
  tags: ['Auth'],
  summary: 'Logout',
  security: securityAuth,
  response: {
    200: {
      description: 'Logout realizado',
      content: {
        'application/json': {
          schema: successSchema({
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Logout realizado com sucesso',
              },
            },
          }),
        },
      },
    },
    ...commonResponses,
  },
};
