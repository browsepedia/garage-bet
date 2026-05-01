import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BetsModule } from './bets/bets.module';
import { FinalBetsModule } from './final-bets/final-bets.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MatchesModule } from './matches/matches.module';
import { NotificationsScheduleService } from './services/notifications-schedule.service';
import { NotificationsService } from './services/notifications.service';
import { PrismaService } from './services/prisma-service';

@Module({
  imports: [
    AuthModule,
    MatchesModule,
    BetsModule,
    FinalBetsModule,
    LeaderboardModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    NotificationsScheduleService,
    PrismaService,
    NotificationsService,
  ],
})
export class AppModule {}
