import { LeaderboardEntry } from '@garage-bet/models';
import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('page') page?: string,
  ): Promise<LeaderboardEntry[]> {
    const parsedPage = page ? Number.parseInt(page, 10) : 0;
    return this.leaderboardService.getLeaderboard(parsedPage);
  }
}
