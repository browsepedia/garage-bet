// apps/garage-bet-api/src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static pool: Pool | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    // Reuse pool across hot-reloads in dev
    if (!PrismaService.pool) {
      PrismaService.pool = new Pool({ connectionString });
    }

    const adapter = new PrismaPg(PrismaService.pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("error", async () => {
      await app.close();
    });
  }
}
