import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers';
import { CreateUserDTOSchema, UpdateUserDTOSchema } from '@/core/src/dtos';
import { authMiddleware, validationMiddleware } from '../../middlewares';
import {
  createUserProfileSchema,
  deleteUserAccountSchema,
  getUserHistorySchema,
  getUserProfileSchema,
  updateUserProfileSchema,
} from '../schemas';

export async function userRoutes(fastify: FastifyInstance) {
  const controller = new UserController();

  fastify.get(
    '/me',
    {
      schema: getUserProfileSchema,
      preHandler: [authMiddleware],
    },
    controller.getProfile.bind(controller)
  );

  fastify.post(
    '/me',
    {
      schema: createUserProfileSchema,
      preHandler: [validationMiddleware(CreateUserDTOSchema, 'body')],
    },
    controller.createProfile.bind(controller)
  );

  fastify.put(
    '/me',
    {
      schema: updateUserProfileSchema,
      preHandler: [
        authMiddleware,
        validationMiddleware(UpdateUserDTOSchema, 'body'),
      ],
    },
    controller.updateProfile.bind(controller)
  );

  fastify.delete(
    '/me',
    {
      schema: deleteUserAccountSchema,
      preHandler: [authMiddleware],
    },
    controller.deleteAccount.bind(controller)
  );

  fastify.get(
    '/me/history',
    {
      schema: getUserHistorySchema,
      preHandler: [authMiddleware],
    },
    controller.getSearchHistory.bind(controller)
  );
}
