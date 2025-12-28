import { FastifyInstance } from 'fastify';

export function registerRequestLogger(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request) => {
    request.startTime = Date.now();

    console.log(`[${request.method}] ${request.url}`, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      ...(request.user && { userId: request.user.id }),
    });
  });

  fastify.addHook('onSend', async (request, reply, payload) => {
    const duration = Date.now() - (request.startTime ?? Date.now());
    const statusCode = reply.statusCode;

    const message =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'alert' : 'success';

    console.log(
      `${message} [${request.method}] ${request.url} - ${statusCode} (${duration}ms)`
    );

    return payload;
  });
}
