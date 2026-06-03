import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../services/prisma-service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}