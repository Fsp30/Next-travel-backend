import { FastifyInstance } from 'fastify';
import { SearchController } from '../controllers';
import {
  getPopularDestinationsSchema,
  searchDestinationSchema,
} from '../schemas';
import { validationMiddleware } from '../../middlewares';
import { GetDestinationInfoDTOSchema } from '@/core/src/dtos';

export async function searchRoutes(fastify: FastifyInstance) {
  const controller = new SearchController();

  fastify.post(
    '/',
    {
      schema: searchDestinationSchema,
      preHandler: [validationMiddleware(GetDestinationInfoDTOSchema, 'body')],
    },
    controller.searchDestination.bind(controller)
  );

  fastify.get(
    '/popular',
    {
      schema: getPopularDestinationsSchema,
    },
    controller.getPopularDestinations.bind(controller)
  );
}
