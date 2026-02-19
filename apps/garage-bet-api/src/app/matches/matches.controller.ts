import { Controller, Get, Headers } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getMatches(@Headers('authorization') authorization?: string) {
    return this.matchesService.getMatches(authorization);
  }
}
