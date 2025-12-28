import { AppFactory } from '../../factories';
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
  }

  ReturnType<typeof AppFactory.getInstance>;
}
