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

      console.log(`[AuthController] User autenticado: ${request.user?.email}`);

      return this.success(reply, result, 200);
    } catch (error) {
      console.error('[AuthController] Erro na autenticação ', error);

      throw error;
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('🔄 [AuthController] Iniciando refresh de token');

      const { refreshToken } = request.body as { refreshToken: string };

      if (!refreshToken) {
        return this.error(reply, 'Refresh token não fornecido', 400);
      }

      const { useCases } = request.app;
      const result = await useCases.refreshToken.execute({ refreshToken });

      console.log('[AuthController] Token renovado com sucesso');

      return this.success(reply, result, 200);
    } catch (error: unknown) {
      console.error('[AuthController] Erro na autenticação:', error);

      if (error instanceof Error) {
        if (error.message.includes('Invalid token')) {
          return this.error(reply, 'Token do Google inválido', 401);
        }
      }

      throw error;
    }
  }
}
