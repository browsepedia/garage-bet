import { defineConfig } from '@prisma/config';
import 'dotenv/config';

function resolveDatabaseUrl(): string {
  const url =
    process.env.PRISMA_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'Set DATABASE_URL or PRISMA_DATABASE_URL in your environment or a .env file at the repo root.',
    );
  }
  return url;
}

export default defineConfig({
  schema: 'apps/garage-bet-api/prisma/schema.prisma',
  migrations: {
    path: 'apps/garage-bet-api/prisma/migrations',
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
