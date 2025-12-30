export const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example: 'Mensagem de erro' },
    details: {
      type: 'object',
      description: 'Detalhes adicionais do erro (apenas em dev)',
    },
  },
  required: ['success', 'error'],
};

export const successSchema = (dataSchema: unknown) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
  },
  required: ['success', 'data'],
});

export const commonResponses = {
  400: {
    description: 'Requisição inválida',
    content: {
      'application/json': {
        schema: errorSchema,
      },
    },
  },
  401: {
    description: 'Não autenticado',
    content: {
      'application/json': {
        schema: errorSchema,
        example: {
          success: false,
          error: 'Token de autenticação não fornecido',
        },
      },
    },
  },
  404: {
    description: 'Recurso não encontrado',
    content: {
      'application/json': {
        schema: errorSchema,
      },
    },
  },
  500: {
    description: 'Erro interno do servidor',
    content: {
      'application/json': {
        schema: errorSchema,
      },
    },
  },
};

export const securityAuth = [{ bearerAuth: [] }];
