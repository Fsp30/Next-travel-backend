import { AppFactory } from '../../factories';
declare module 'fastify' {
  type AppInstance = ReturnType<typeof AppFactory.getInstance>;

  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
    app: AppInstance;
  }
}
