import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from './base.controller';
import { validateGetDestinationInfoDTO } from '@/core/src/dtos';
import z from 'zod';

export class SearchController extends BaseController {
  async searchDestination(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationInput = validateGetDestinationInfoDTO(request.body);

      console.log(
        `[SearchController] Buscando destino: ${validationInput.cityName}, ${validationInput.state}`
      );

      const { useCases } = request.app;
      const result = await useCases.searchDestination.execute(validationInput);

      console.log(`[SearchController] Busca concluída: ${result.city.name}`);
      return this.success(reply, result);
    } catch (error: unknown) {
      console.error('[UserController] Erro ao buscar destino:', error);

      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err) => err.message).join(', ');
        return this.error(reply, messages, 400);
      }

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('não encontrad')
        ) {
          return this.error(
            reply,
            'Destino não encontrado. Verifique o nome da cidade e estado.',
            404
          );
        }

        if (errorMessage.includes('api') || errorMessage.includes('external')) {
          return this.error(
            reply,
            'Erro ao buscar informações externas. Tente novamente em alguns instantes.',
            503
          );
        }

        if (
          errorMessage.includes('slug') &&
          errorMessage.includes('inválido')
        ) {
          return this.error(
            reply,
            'Nome de cidade inválido. Use apenas letras, números e espaços.',
            400
          );
        }

        if (
          errorMessage.includes('timeout') ||
          errorMessage.includes('timed out')
        ) {
          return this.error(
            reply,
            'Tempo limite excedido. A busca está demorando mais que o esperado.',
            504
          );
        }
      }

      throw error;
    }
  }
}
