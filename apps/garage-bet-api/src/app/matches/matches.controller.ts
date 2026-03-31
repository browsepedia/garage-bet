import { Controller, Get, Headers, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getMatches(@Headers('authorization') authorization?: string) {
    return this.matchesService.getMatches(authorization);
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
}
