import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { NotificationsService } from '../services/notifications.service';
import { PrismaService } from '../services/prisma-service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [AuthModule, LeaderboardModule],
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService, NotificationsService],
})
export class MatchesModule {}
