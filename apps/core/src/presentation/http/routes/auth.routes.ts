import { FastifyInstance } from 'fastify';
import {
  loginGoogleSchema,
  logoutSchema,
  refreshTokenSchema,
} from '../schemas';
import { validationMiddleware } from '../../middlewares';
import { AuthenticateUserDTOSchema } from '@/core/src/dtos';
import { AuthController } from '../controllers';
export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();
  fastify.post(
    '/google',
    {
      schema: loginGoogleSchema,
      preHandler: [validationMiddleware(AuthenticateUserDTOSchema, 'body')],
    },
    controller.authenticateWithGoogle.bind(controller)
  );

  fastify.post(
    '/refresh-token',
    {
      schema: refreshTokenSchema,
    },
    controller.refreshToken.bind(controller)
  );
  fastify.post(
    '/logout',
    {
      schema: logoutSchema,
    },
    controller.logout.bind(controller)
  );
}
