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
}
