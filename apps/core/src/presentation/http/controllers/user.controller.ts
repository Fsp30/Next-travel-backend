import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from './base.controller';
import { validateCreateUserDTO } from '../../../dtos/requests/user/CreateUserDTO';
import z from 'zod';
import { validateUpdateUserDTO } from '@/core/src/dtos';

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

  async createProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.body) {
        return this.error(reply, 'Informações inválidas', 400);
      }

      const { useCases } = request.app;

      const validatedInput = validateCreateUserDTO(request.body);

      const user = await useCases.createUser.execute(validatedInput);

      return this.success(reply, user, 201);
    } catch (error) {
      console.log('[userController] falha ao criar usuário: ', error);

      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => err.message).join(', ');
        return this.error(reply, messages, 400);
      }

      if (error instanceof Error) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate')
        ) {
          return this.error(reply, 'Usuário já existe', 409);
        }

        if (
          error.message.includes('validation') ||
          error.message.includes('invalid')
        ) {
          return this.error(reply, error.message, 400);
        }
      }

      throw error;
    }
  }
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return this.error(reply, 'Usuário não autenticado', 401);
      }

      const { useCases } = request.app;

      const validatedInput = validateUpdateUserDTO(request.body);

      const updatedUser = await useCases.updateUser.execute(validatedInput);

      return this.success(reply, updatedUser, 202);
    } catch (error: unknown) {
      console.error('[UserController] Erro ao atualizar perfil:', error);
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => err.message).join(', ');
        return this.error(reply, messages, 400);
      }

      if (error instanceof Error) {
        if (error.message.includes('not found'))
          return this.error(reply, 'Usuário não encontrado', 404);
      }

      throw error;
    }
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return this.error(reply, 'Usuário não autenticado', 401);
      }

      const { useCases } = request.app;

      const userId = request.user.id;
      console.log(`[UserController] Deletando conta: ${userId}`);

      await useCases.deleteUser.execute({ userId });

      console.log('[UserController] Conta deletada com sucesso');

      return this.noContent(reply);
    } catch (error) {
      console.error('❌ [UserController] Erro ao deletar conta:', error);

      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => err.message).join(', ');
        return this.error(reply, messages, 400);
      }

      if (error instanceof Error) {
        if (error.message.includes('not found'))
          return this.error(reply, 'Usuário não encontrado', 404);
      }

      throw error;
    }
  }
}
