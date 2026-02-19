import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "apps/garage-bet-api/prisma/schema.prisma",
  migrations: {
    path: "apps/garage-bet-api/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
