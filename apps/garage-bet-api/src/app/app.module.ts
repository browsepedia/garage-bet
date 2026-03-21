import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BetsModule } from './bets/bets.module';
import { FinalBetsModule } from './final-bets/final-bets.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [
    AuthModule,
    MatchesModule,
    BetsModule,
    FinalBetsModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
