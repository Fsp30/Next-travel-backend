import { FastifyReply } from 'fastify';

export abstract class BaseController {
  protected success<T>(reply: FastifyReply, data: T, statusCode: number = 200) {
    return reply.status(statusCode).send({
      success: true,
      data,
    });
  }

  protected noContent(reply: FastifyReply) {
    return reply.status(204).send();
  }

  protected created<T>(reply: FastifyReply, data: T, location?: string) {
    if (location) {
      reply.header('location', location);
    }

    return reply.status(201).send({
      success: true,
      data,
    });
  }
  protected error(
    reply: FastifyReply,
    message: string,
    statusCode: number = 400,
    details?: Record<string, string | number | boolean> 
  ) {
    return reply.status(statusCode).send({
      success: false,
      error: message,
      ...(details && { details }),
    });
  }
}
