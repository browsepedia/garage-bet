import {
  LeaderboardEntry,
  LeaderboardEntryWithRank,
  UserStats,
} from '@garage-bet/models';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { scoreFinalBet } from '../final-bets/final-bet-scoring';
import { PrismaService } from '../services/prisma-service';

const PAGE_SIZE = 50;

type UserStats = Omit<LeaderboardEntry, 'winRate'>;

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(page = 0): Promise<LeaderboardEntry[]> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
    const full = await this.computeFullLeaderboard();
    const start = safePage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return full.slice(start, end);
  }

  async getLeaderboardEntryForUser(
    userId: string,
  ): Promise<LeaderboardEntryWithRank> {
    const full = await this.computeFullLeaderboard();
    const index = full.findIndex((e) => e.userId === userId);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    return { ...full[index], rank: index + 1 };
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const full = await this.computeFullLeaderboard();
    const index = full.findIndex((e) => e.userId === userId);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    const entry = full[index];
    return {
      userId: entry.userId,
      name: entry.name,
      avatarUrl: entry.avatarUrl,
      points: entry.totalPoints,
      maxPoints: entry.betCount * 3,
      bets: entry.betCount,
      rank: index + 1,
      totalPlayers: full.length,
      wins: entry.totalWins,
      results: entry.totalResults,
      losses: entry.totalLosses,
      finalBetPoints: entry.finalBetPoints,
    };
  }

  private async computeFullLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        email: true,
        bets: {
          select: {
            homeScore: true,
            awayScore: true,
            match: {
              select: {
                status: true,
                homeScore: true,
                awayScore: true,
              },
            },
          },
        },
      },
    });

    const byUser = new Map<string, UserStats>(
      users.map((user) => {
        const name =
          user.name?.trim() ||
          user.email?.split('@')[0] ||
          `User ${user.id.slice(0, 6)}`;
        const avatarUrl =
          user.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name,
          )}&background=EA580C&color=ffffff&bold=true`;

        return [
          user.id,
          {
            userId: user.id,
            name,
            avatarUrl,
            totalPoints: 0,
            totalWins: 0,
            totalLosses: 0,
            totalResults: 0,
            betCount: 0,
            finalBetPoints: 0,
          },
        ];
      }),
    );

    const finalBets = await this.prisma.finalPlayerBet.findMany({
      include: { season: true },
    });

    for (const fb of finalBets) {
      const s = fb.season;
      if (
        !s.finalHomeTeamId ||
        !s.finalAwayTeamId ||
        s.finalHomeScore === null ||
        s.finalHomeScore === undefined ||
        s.finalAwayScore === null ||
        s.finalAwayScore === undefined
      ) {
        continue;
      }
      const pts = scoreFinalBet(
        {
          predictedHomeTeamId: fb.predictedHomeTeamId,
          predictedAwayTeamId: fb.predictedAwayTeamId,
          predictedHomeScore: fb.predictedHomeScore,
          predictedAwayScore: fb.predictedAwayScore,
        },
        {
          finalHomeTeamId: s.finalHomeTeamId,
          finalAwayTeamId: s.finalAwayTeamId,
          finalHomeScore: s.finalHomeScore,
          finalAwayScore: s.finalAwayScore,
        },
      );
      const stats = byUser.get(fb.userId);
      if (stats) {
        stats.finalBetPoints += pts;
        stats.totalPoints += pts;
      }
    }

    for (const user of users) {
      const stats = byUser.get(user.id);
      if (!stats) {
        continue;
      }

      for (const bet of user.bets) {
        stats.betCount += 1;

        if (bet.match.status !== MatchStatus.FINISHED) {
          continue;
        }

        const actualHome = bet.match.homeScore ?? 0;
        const actualAway = bet.match.awayScore ?? 0;
        const predictedOutcome = Math.sign(bet.homeScore - bet.awayScore);
        const actualOutcome = Math.sign(actualHome - actualAway);
        const isExact =
          bet.homeScore === actualHome && bet.awayScore === actualAway;

        if (isExact) {
          stats.totalPoints += 3;
          stats.totalWins += 1;
        } else if (predictedOutcome === actualOutcome) {
          stats.totalPoints += 1;
          stats.totalResults += 1;
        } else {
          stats.totalLosses += 1;
        }
      }
    }

    return Array.from(byUser.values())
      .map<LeaderboardEntry>((entry) => ({
        ...entry,
        winRate:
          entry.betCount > 0
            ? Number((entry.totalPoints / (entry.betCount * 3)).toFixed(4))
            : 0,
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints)
          return b.totalPoints - a.totalPoints;
        if (b.totalWins !== a.totalWins) {
          return b.totalWins - a.totalWins;
        }
        if (b.totalResults !== a.totalResults) {
          return b.totalResults - a.totalResults;
        }
        return a.name.localeCompare(b.name);
      });
  }
}
