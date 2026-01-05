import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  sub?: string;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {

  const publicRoutes = [
    '/auth/google',
    '/auth/refresh-token', 
    '/auth/logout',
    '/docs',
    '/',
    '/users',
    '/search',
    '/search/popular',
  ];

  const url = request.url.split('?')[0];
  if (publicRoutes.includes(url) || url.startsWith('/docs')) {
    return;
  }

  try {
    let token: string | undefined;

  
    if (request.cookies?.access_token) {
      token = request.cookies.access_token;
      console.log('[Auth] Token encontrado no cookie');
    } 
    else if (request.headers.authorization) {
      const authHeader = request.headers.authorization;

      if (!authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: 'Formato de token inválido. Use Bearer <token>',
        });
      }

      token = authHeader.substring(7);
      console.log('[Auth] Token encontrado no header');
    }

    if (!token) {
      const refreshed = await attemptTokenRefresh(request, reply);
      if (!refreshed) {
        return reply.status(401).send({
          success: false,
          error: 'Token de autenticação não fornecido',
        });
      }
      return; 
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET não configurada');
    }

    try {
      const decoded = jwt.verify(token, secret) as JWTPayload;

      const id = decoded.userId;
      
      if (!id) {
        return reply.status(401).send({
          success: false,
          error: 'Token inválido: sem identificador de usuário',
          code: 'INVALID_TOKEN',
        });
      }

      const { useCases } = request.app;
      const userResult = await useCases.getUser.execute({ id });
      
      if (!userResult || !userResult.user) {
        return reply.status(401).send({
          success: false,
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      request.user = {
        id: userResult.user.id,
        email: userResult.user.email,
      };

      console.log(`[Auth] Usuário autenticado: ${userResult.user.email} (ID: ${userResult.user.id})`);

    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        console.log('[Auth] Token expirado, tentando renovar...');
        
        const refreshResult = await attemptTokenRefresh(request, reply);
        
        if (!refreshResult) {
          return reply.status(401).send({
            success: false,
            error: 'Sessão expirada. Por favor, faça login novamente.',
            code: 'SESSION_EXPIRED',
          });
        }
        
        return; 
      }
    
      console.error('[Auth] Erro JWT:', jwtError);
      throw jwtError;
    }

  } catch (error) {
    console.error('[Auth] Erro na validação do token:', error);

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


async function attemptTokenRefresh(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  try {
    const refreshToken = request.cookies?.refresh_token;
    
    if (!refreshToken) {
      console.log('[Auth] Nenhum refresh token disponível');
      return false;
    }

    console.log('[Auth] Tentando renovar token com refresh token...');
    
    const { useCases, services } = request.app;
    
    try {
      const result = await useCases.refreshToken.execute({ refreshToken });
      
      if (!result.accessToken) {
        console.error('[Auth] Nenhum access token retornado do refresh');
        return false;
      }

      const tokenPayload = await services.auth.verifyAccessToken(result.accessToken)

      const userResult = await useCases.getUser.execute({ id: tokenPayload.userId });
      
      if (!userResult || !userResult.user) {
        console.error('[Auth] Usuário não encontrado após refresh');
        return false;
      }

      console.log('[Auth] Token renovado com sucesso');

      reply.setCookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: result.expiresIn || 3600,
      });

      if (result.refreshToken) {
        reply.setCookie('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      request.user = {
        id: userResult.user.id,
        email: userResult.user.email,
      };

      return true;

    } catch (refreshError) {
      console.error('[Auth] Erro ao renovar token:', refreshError);
      
      if (refreshError instanceof Error && 
          (refreshError.message.includes('Invalid') || 
           refreshError.message.includes('expired'))) {
        
        reply
          .clearCookie('access_token')
          .clearCookie('refresh_token');
      }
      
      return false;
    }

  } catch (error) {
    console.error('[Auth] Erro ao tentar renovar token:', error);
    return false;
  }
}

export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _: FastifyReply
) {
  try {
    let token: string | undefined;

    if (request.cookies?.access_token) {
      token = request.cookies.access_token;
    } else if (request.headers.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.substring(7);
    }

    if (token && process.env.JWT_ACCESS_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as JWTPayload;

        const { useCases } = request.app;
        const userResult = await useCases.getUser.execute({ id: decoded.userId });
        
        if (userResult && userResult.user) {
          request.user = {
            id: userResult.user.id,
            email: userResult.user.email,
          };
          console.log(`[OptionalAuth] Usuário autenticado: ${userResult.user.email}`);
        }
      } catch (error) {
        request.user = undefined;
      }
    }
  } catch (error) {
    request.user = undefined;
  }
}