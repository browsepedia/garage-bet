import {
  LeaderboardEntry,
  LeaderboardEntryWithRank,
  UserStats,
} from '@garage-bet/models';
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

  /** Full stats for the authenticated user including rank and max points. */
  @Get('me/stats')
  async getMyStats(
    @Headers('authorization') authorization?: string,
  ): Promise<UserStats> {
    const user = await this.authService.me(authorization);
    return this.leaderboardService.getUserStats(user.id);
  }

  /** Same body as `GET user/:userId`, but user id comes from the bearer token. */
  @Get('me')
  async getMyLeaderboardEntry(
    @Headers('authorization') authorization?: string,
  ): Promise<LeaderboardEntryWithRank> {
    const user = await this.authService.me(authorization);
    return this.leaderboardService.getLeaderboardEntryForUser(user.id);
  }

  @Get('user/:userId')
  async getLeaderboardEntryForUser(
    @Param('userId') userId: string,
  ): Promise<LeaderboardEntryWithRank> {
    return this.leaderboardService.getLeaderboardEntryForUser(userId);
  }

  /** Full stats for any user (same shape as `GET me/stats`). */
  @Get('user/:userId/stats')
  async getUserStats(
    @Param('userId') userId: string,
  ): Promise<UserStats> {
    return this.leaderboardService.getUserStats(userId);
  }
}
