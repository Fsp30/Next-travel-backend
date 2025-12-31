import 'dotenv/config';
import Redis from 'ioredis';
import { createApp } from './core/src/presentation/http/app';
import { PrismaClient } from '../generated/prisma/client';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {

    const connectionString = `${process.env.DATABASE_URL}`;

    const adapter = new PrismaPg({ connectionString });
    console.log('[Server] Conectando ao PostgreSQL...');
    const prisma = new PrismaClient({ adapter });

    console.log('[Server] Conectando ao Redis...');
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('✅ [Server] Redis conectado');
    });

    redis.on('error', (err) => {
      console.error('❌ [Server] Erro no Redis:', err);
    });

    // Testar conexão Prisma
    await prisma.$connect();
    console.log('✅ [Server] PostgreSQL conectado');

    // ═══════════════════════════════════════════════════════════
    // 2. CRIAR APLICAÇÃO
    // ═══════════════════════════════════════════════════════════
    const app = await createApp(prisma, redis);

    // ═══════════════════════════════════════════════════════════
    // 3. INICIAR SERVIDOR
    // ═══════════════════════════════════════════════════════════
    await app.listen({ port: PORT, host: HOST });

    console.log('\n🚀 ════════════════════════════════════════════');
    console.log(`   Server rodando em: http://localhost:${PORT}`);
    console.log(`   Documentação: http://localhost:${PORT}/docs`);
    console.log('════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════
    // 4. GRACEFUL SHUTDOWN
    // ═══════════════════════════════════════════════════════════
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n🛑 [Server] Recebido ${signal}, encerrando...`);

        // Parar de aceitar novas requisições
        await app.close();
        console.log('✅ [Server] Fastify encerrado');

        // Desconectar Prisma
        await prisma.$disconnect();
        console.log('✅ [Server] Prisma desconectado');

        // Desconectar Redis
        redis.disconnect();
        console.log('✅ [Server] Redis desconectado');

        process.exit(0);
      });
    }
  } catch (error) {
    console.error('❌ [Server] Erro ao iniciar:', error);
    process.exit(1);
  }
}

// Iniciar aplicação
start();
