import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from './base.controller';
import { AuthenticateUserDTOSchema } from '../../../dtos/requests/auth/AuthenticateUserDTO';

export class AuthController extends BaseController {
  async authenticateWithGoogle(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('[AuthController] Iniciando autenticação google');

      const dto = AuthenticateUserDTOSchema.parse(request.body);
      const { useCases } = request.app;

      const result = await useCases.authenticateUser.execute(dto);

      if (!result || !result.user || !result.accessToken) {
        console.error('[AuthController] Resultado inválido:', result);
        return this.error(reply, 'Falha na autenticação', 401);
      }

      console.log(`[AuthController] User autenticado: ${result.user.email}`);

      reply
        .setCookie('access_token', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: result.expiresIn,
        })
        .setCookie('refresh_token', result.refreshToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

      return this.success(
        reply,
        {
          user: result.user,
          isNewUser: result.isNewUser,
        },
        200
      );
    } catch (error) {
      console.error('[AuthController] Erro na autenticação:', error);
      return this.error(reply, 'Erro interno na autenticação', 500);
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔄 [AuthController] Iniciando refresh de token');

      const refreshTokenFromCookie = request.cookies.refresh_token;

      const { refreshToken: refreshTokenFromBody } = request.body as {
        refreshToken?: string;
      };
      const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

      if (!refreshToken) {
        return this.error(reply, 'Refresh token não fornecido', 400);
      }

      const { useCases, services } = request.app;

      const result = await useCases.refreshToken.execute({ refreshToken });

      if (!result.accessToken) {
        return this.error(reply, 'Falha ao renovar token', 401);
      }

      const tokenPayload = await services.auth.verifyAccessToken(
        result.accessToken
      );

      const userResult = await useCases.getUser.execute({
        id: tokenPayload.userId,
      });

      if (!userResult || !userResult.user) {
        return this.error(reply, 'Usuário não encontrado', 404);
      }

      console.log('[AuthController] Token renovado com sucesso');

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

      return this.success(
        reply,
        {
          message: 'Token atualizado',
          user: userResult.user,
        },
        200
      );
    } catch (error: unknown) {
      console.error('[AuthController] Erro no refresh:', error);

      reply.clearCookie('access_token').clearCookie('refresh_token');

      if (error instanceof Error) {
        if (
          error.message.includes('Invalid') ||
          error.message.includes('expired')
        ) {
          return this.error(reply, 'Token inválido ou expirado', 401);
        }
      }

      return this.error(reply, 'Erro ao renovar token', 500);
    }
  }

  async logout(_: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('[AuthController] Logout realizado');

      reply.clearCookie('access_token').clearCookie('refresh_token');

      return this.success(
        reply,
        {
          message: 'Logout realizado com sucesso',
        },
        200
      );
    } catch (error) {
      console.error('[AuthController] Erro no logout:', error);

      reply.clearCookie('access_token').clearCookie('refresh_token');

      throw error;
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return this.error(reply, 'Não autenticado', 401);
      }

      const { useCases } = request.app;

      const result = await useCases.getUser.execute({ id: request.user.id });

      if (!result || !result.user) {
        return this.error(reply, 'Usuário não encontrado', 404);
      }

      return this.success(
        reply,
        {
          user: result.user,
        },
        200
      );
    } catch (error) {
      console.error('[AuthController] Erro ao obter usuário atual:', error);
      return this.error(reply, 'Erro interno', 500);
    }
  }
}
