import { PrismaClient } from '@generated/prisma';
import { AppFactory } from '../../factories';
import Redis from 'ioredis';
import { FastifyRequest } from 'fastify';

let appInstance: ReturnType<typeof AppFactory.getInstance> | null = null;

export function initializeDependecies(prisma: PrismaClient, redis: Redis) {
  appInstance = AppFactory.getInstance(prisma, redis);
  console.log('AppFactory initialize');
}

export async function injectDependenciesMiddleware(request: FastifyRequest) {
  if (!appInstance) {
    throw new Error('AppFactory não inicializado');
  }

  request.app = appInstance;
}
