import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

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
    let token: string | undefined;

    if (request.cookies?.access_token) {
      token = request.cookies.access_token;
      console.log('[Auth] Token encontrado no cookie');
    } else if (request.headers.authorization) {
      const authHeader = request.headers.authorization;

      if (!authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: 'Formato de token inválido. Use Bearer <token>',
        });
      }

      const HEADER_MINUS_THE_BEARER = 7;
      token = authHeader.substring(HEADER_MINUS_THE_BEARER);
      console.log('[Auth] Token encontrado no header');
    }

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET não configurada');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    request.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    console.log(`[Auth] Usuário autenticado: ${decoded.email}`);
  } catch (error) {
    console.error('[Auth] Erro na validação do token:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }

    return reply.status(401).send({
      success: false,
      error: 'Erro na autenticação',
    });
  }
}
