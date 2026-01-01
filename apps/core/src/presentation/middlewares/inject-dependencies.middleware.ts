import { PrismaClient } from '@generated/prisma/client';
import { AppFactory } from '../../factories';
import Redis from 'ioredis';
import { FastifyRequest, FastifyReply } from 'fastify';

let appInstance: ReturnType<typeof AppFactory.getInstance> | null = null;

export function initializeDependecies(prisma: PrismaClient, redis: Redis) {
  appInstance = AppFactory.getInstance(prisma, redis);
  console.log('[AppFactory] Inicializado');
}

export async function injectDependenciesMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!appInstance) {
    reply.code(500);
    throw new Error('AppFactory não inicializado');
  }

  request.app = appInstance;
}
