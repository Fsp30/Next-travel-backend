import { FastifyError, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandlerMiddleware(
  error: FastifyError,
  reply: FastifyReply
) {
  console.error('Handler Error', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    cause: error.cause,
  });

  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Dados inválidos',
      details: error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
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

  const statusCode = statusCodeMap[error.name] || error.statusCode || 500;

  return reply.status(statusCode).send({
    success: false,
    error: error.message || 'Erro interno do servidor',
  });
}
