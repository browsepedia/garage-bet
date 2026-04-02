import { UpdateMatchScorePayload } from '@garage-bet/models';
import { Body, Controller, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

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
  updateMatchScore(
    @Param('matchId') matchId: string,
    @Body() body: UpdateMatchScorePayload,
    @Headers('authorization') authorization?: string,
  ) {
    return this.matchesService.updateMatchScore(matchId, body, authorization);
  }
}
