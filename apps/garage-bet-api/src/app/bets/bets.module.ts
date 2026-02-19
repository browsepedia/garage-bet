import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../services/prisma-service';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';

@Module({
  imports: [AuthModule],
  controllers: [BetsController],
  providers: [BetsService, PrismaService],
})
export class BetsModule {}
