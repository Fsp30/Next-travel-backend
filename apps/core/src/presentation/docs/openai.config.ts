import { FastifyInstance } from 'fastify';

export const openaiConfig = {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'Travel Planner API',
      description: `
## API para planejamento de viagens com informações sobre destinos brasileiros.


- Autenticação via Google OAuth
- Busca de destinos com cache inteligente
- Informações de clima
- Estimativas de custos (transporte e hospedagem)
- Histórico de buscas
- Recomendações geradas por IA

## Autenticação

A maioria dos endpoints requer autenticação JWT.

1. Faça login com Google: \`POST /api/auth/google\`
2. Use o \`accessToken\` retornado no header: \`Authorization: Bearer <token>\`
3. Tokens expiram em 7 dias. Use \`POST /api/auth/refresh\` para renovar.
      `,
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@travelplanner.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Desenvolvimento',
      },
      {
        url: 'https://api.travelplanner.com',
        description: 'Produção',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação e gerenciamento de tokens',
      },
      {
        name: 'User',
        description: 'Gerenciamento de perfil do usuário',
      },
      {
        name: 'Search',
        description: 'Busca de destinos e informações',
      },
      {
        name: 'Health',
        description: 'Status da API e dependências',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtido via login',
        },
      },
    },
  },
};

export const scalarConfig = {
  routePrefix: '/docs',
  configuration: {
    theme: 'purple',
    layout: 'modern',
    defaultHttpClient: {
      targetKey: 'javascript',
      clientKey: 'fetch',
    },
    authentication: {
      preferredSecurityScheme: 'bearerAuth',
    },
    spec: {
      url: '/docs/json',
    },
  },
};

export async function registerScalar(fastify: FastifyInstance) {
  const scalarPlugin = await import('@scalar/fastify-api-reference');

  await fastify.register(scalarPlugin.default, {
    routePrefix: '/docs',
    configuration: {
      theme: 'purple',
      spec: {
        content: openaiConfig.openapi,
      },
    },
  });

  console.log('📚 [Docs] Scalar disponível em: http://localhost:8080/docs');
}
