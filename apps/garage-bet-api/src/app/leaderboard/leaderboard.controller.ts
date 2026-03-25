import { LeaderboardEntry } from '@garage-bet/models';
import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getLeaderboard(
    @Query('page') page?: string,
  ): Promise<LeaderboardEntry[]> {
    const parsedPage = page ? Number.parseInt(page, 10) : 0;
    return this.leaderboardService.getLeaderboard(parsedPage);
  }

  /** Same body as `GET user/:userId`, but user id comes from the bearer token. */
  @Get('me')
  async getMyLeaderboardEntry(
    @Headers('authorization') authorization?: string,
  ): Promise<LeaderboardEntry> {
    const user = await this.authService.me(authorization);
    return this.leaderboardService.getLeaderboardEntryForUser(user.id);
  }

  @Get('user/:userId')
  async getLeaderboardEntryForUser(
    @Param('userId') userId: string,
  ): Promise<LeaderboardEntry> {
    return this.leaderboardService.getLeaderboardEntryForUser(userId);
  }
}
