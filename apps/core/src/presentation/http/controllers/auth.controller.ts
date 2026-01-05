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

        return reply.status(401).send({
          error: 'Falha na autenticação',
        });
      }

      console.log(
        `[AuthController] User autenticado: ${result.user.email}`
      );

      console.log(result)

      return this.success(reply, result, 200);
    } catch (error) {
      console.error('[AuthController] Erro na autenticação', error);

      return reply.status(500).send({
        error: 'Erro interno na autenticação',
      });
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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('[AuthController] Logout realizado');

      return this.success(reply, { message: 'Logout feito com sucesso' });
    } catch (error) {
      console.error(
        `[AuthController] Erro ao tentar desconectar {user: ${request.user?.id}}:`,
        error
      );
      throw error;
    }
  }
}
