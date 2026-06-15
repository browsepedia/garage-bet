import { UpdateMatchScorePayload } from '@garage-bet/models';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getMatches(@Headers('authorization') authorization?: string) {
    return this.matchesService.getMatches(authorization);
  }

  @Get('day')
  getMatchesForDay(
    @Query('date') date: string,
    @Query('timeZone') timeZone: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.matchesService.getMatchesForLocalDay(
      date,
      timeZone,
      authorization,
    );
  }

  @Get('season/:seasonId')
  getMatchesForSeason(
    @Param('seasonId') seasonId: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.matchesService.getMatchesForSeason(seasonId, authorization);
  }

  @Get(':matchId/bets')
  listMatchBets(
    @Param('matchId') matchId: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.matchesService.listBetsForMatch(matchId, authorization);
  }

  @Patch(':matchId/score')
  async updateMatchScore(
    @Param('matchId') matchId: string,
    @Body() body: UpdateMatchScorePayload,
    @Headers('authorization') authorization?: string,
  ) {
    const result = await this.matchesService.updateMatchScore(
      matchId,
      body,
      authorization,
    );

    if (!result.ok) {
      throw new BadRequestException('Failed to update match score');
    }

    const bets =
      await this.matchesService.getBetsForEndOfMatchNotifications(matchId);

    if (body.isEnded) {
      for (const bet of bets) {
        if (bet.expoPushTokens.length > 0) {
          const title =
            bet.betStatus === 'WON'
              ? '🎯 You got the exact score right!'
              : bet.betStatus === 'LOST'
                ? '❌ You got the exact score wrong!'
                : '💙 You got the outcome correct!';
          await this.notificationsService.sendNotification(
            bet.expoPushTokens,
            title,
            `The match ${bet.homeTeamName} vs ${bet.awayTeamName} has ended with score ${bet.matchHomeScore} - ${bet.matchAwayScore}`,
            {
              matchId,
              type: 'match-ended',
            },
          );
        }
      }
    } else {
      for (const bet of bets) {
        if (bet.expoPushTokens.length > 0) {
          const title =
            bet.betStatus === 'WON'
              ? '⚽ Score changed — your prediction matches perfectly!'
              : bet.betStatus === 'LOST'
                ? '⚽ Score changed — your prediction does not match!'
                : '⚽ Goal! The outcome matches your score prediction!';
          await this.notificationsService.sendNotification(
            bet.expoPushTokens,
            title,
            `The match ${bet.homeTeamName} vs ${bet.awayTeamName} has ended with score ${bet.matchHomeScore} - ${bet.matchAwayScore}`,
            {
              matchId,
              type: 'match-ended',
            },
          );
        }
      }
    }
  }
}
