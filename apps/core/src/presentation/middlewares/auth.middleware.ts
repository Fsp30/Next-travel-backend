import { FastifyReply, FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Formato de token inválido. Use Bearer <token>',
      });
    }

    const HEADER_MINUS_THE_BEARER = 7;

    const token = authHeader.substring(HEADER_MINUS_THE_BEARER);
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET não configurada');
    }

    const decoded = verify(token, secret) as JWTPayload;

    request.user = {
      id: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.warn(
      '[Auth] Token opcional inválido, continuando sem auth...',
      error
    );
  }
}
