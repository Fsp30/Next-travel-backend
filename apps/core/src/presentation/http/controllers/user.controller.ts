import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from './base.controller';

export class UserController extends BaseController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return this.error(reply, 'Usuário não autenticado', 401);
      }

      const id = request.user.id;
      const { useCases } = request.app;

      const user = await useCases.getUser.execute({ id });

      return this.success(reply, user);
    } catch (error) {
      console.log('[userController] falha ao buscar perfil: ', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return this.error(reply, 'Usuário não encontrado', 404);
        }
      }
      throw error;
    }
  }
}
