import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { searchRoutes } from './search.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  console.log('[Routes] Registrando rotas...');

  await fastify.register(authRoutes, { prefix: '/api/auth' });
  console.log('[Routes] Auth routes registradas');

  await fastify.register(userRoutes, { prefix: '/api/users' });
  console.log('[Routes] User routes registradas');

  await fastify.register(searchRoutes, { prefix: '/api/search' });
  console.log('[Routes] Search routes registradas');

  console.log('[Routes] Todas as rotas registradas com sucesso!');
}
