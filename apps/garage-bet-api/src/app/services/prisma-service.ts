// apps/garage-bet-api/src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static pool: Pool | null = null;

  constructor() {
    const rawConnectionString =
      process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!rawConnectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    let connectionString = rawConnectionString;
    try {
      const parsedUrl = new URL(rawConnectionString);
      parsedUrl.searchParams.delete('sslmode');
      parsedUrl.searchParams.delete('ssl');
      connectionString = parsedUrl.toString();
    } catch {
      // Keep original value if URL parsing fails.
    }

    const shouldUseSsl =
      process.env.NODE_ENV === 'production' ||
      /sslmode=require/i.test(rawConnectionString) ||
      process.env.PGSSLMODE === 'require';

    // Reuse pool across hot-reloads in dev
    if (!PrismaService.pool) {
      PrismaService.pool = new Pool({
        connectionString,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
      });
    }

    const adapter = new PrismaPg(PrismaService.pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('error', async () => {
      await app.close();
    });
  }
}
