import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodType, ZodError } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export function validationMiddleware<T, S extends RequestSource = 'body'>(
  schema: ZodType<T>,
  source: S = 'body' as S
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request[source];
      const validated = schema.parse(data);

      (request as unknown as Record<string, unknown>)[source] = validated;

      console.log(`[Validation] ${source} validado com sucesso`);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(`[Validation] Erro no ${source}:`, error.issues);

        return reply.status(400).send({
          success: false,
          error: `Dados inválidos no ${source}`,
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      throw error;
    }
  };
}
