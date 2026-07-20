import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { PrismaService } from '../services/prisma-service';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import { FinalBetsController } from './final-bets.controller';
import { FinalBetsService } from './final-bets.service';

@Module({
  imports: [AuthModule, LeaderboardModule],
  controllers: [FinalBetsController],
  providers: [FinalBetsService, PrismaService, AdminApiKeyGuard],
  exports: [FinalBetsService],
})
export class FinalBetsModule {}
