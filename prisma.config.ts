import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'apps/garage-bet-api/prisma/schema.prisma',
  migrations: {
    path: 'apps/garage-bet-api/prisma/migrations',
  },
  datasource: {
    url: env('PRISMA_DATABASE_URL'),
  },
});
