import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandlerMiddleware(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.error('Handler Error', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    name: error.name,
  });

  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Dados inválidos',
      details: error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        err: request,
      })),
    });
  }

  const statusCodeMap: Record<string, number> = {
    ValidationError: 400,
    NotFoundError: 404,
    UnauthorizedError: 401,
    ForbiddenError: 403,
    ConflictError: 409,
  };

  const statusCode = statusCodeMap[error.name] ?? error.statusCode ?? 500;

  return reply.status(statusCode).send({
    success: false,
    error: error.message || 'Erro interno do servidor',
  });
}
