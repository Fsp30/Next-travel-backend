import Redis from 'ioredis';
import { registerScalar } from '../docs/openai.config';
import {
  errorHandlerMiddleware,
  initializeDependecies,
  injectDependenciesMiddleware,
  rateLimitMiddleware,
  registerRequestLogger,
} from '../middlewares';
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@generated/prisma/client';
import { registerRoutes } from './routes';
import fastifyCookie from '@fastify/cookie';

export async function createApp(
  prisma: PrismaClient,
  redis: Redis
): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
            },
          }
          : undefined,
    },
    disableRequestLogging: true,
  });

  console.log('[App] Inicializando dependências...');
  initializeDependecies(prisma, redis);

  console.log('[App] Registrando middlewares...');

  registerRequestLogger(fastify);

  fastify.addHook('onRequest', injectDependenciesMiddleware);

  fastify.addHook('onRequest', rateLimitMiddleware);

  fastify.setErrorHandler(errorHandlerMiddleware);

  console.log('[App] Registrando documentação...');
  await registerScalar(fastify);

  await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret-key',
    parseOptions: {}
  });


  await fastify.register(import('@fastify/cors'), {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  console.log('[App] Registrando rotas...');

  await registerRoutes(fastify);

  fastify.get('/', async () => {
    return {
      message: 'Next Travel API',
      version: '1.0.0',
      docs: '/docs',
    };
  });

  return fastify;
}
