import { MatchData } from '@garage-bet/models';
import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../services/prisma-service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async getMatches(authorizationHeader?: string): Promise<MatchData[]> {
    const user = await this.authService.me(authorizationHeader);

    const matches = await this.prisma.match.findMany({
      include: {
        season: {
          include: {
            competition: true,
          },
        },
        homeTeam: true,
        awayTeam: true,
        bets: {
          where: { userId: user.id },
          take: 1,
        },
      },
      orderBy: {
        kickoffAt: 'asc',
      },
    });

    return matches.map((match) => {
      const userBet = match.bets[0];
      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;
      const homeBetScore = userBet?.homeScore ?? 0;
      const awayBetScore = userBet?.awayScore ?? 0;

      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore,
        awayScore,
        kickoffAt: match.kickoffAt.toISOString(),
        status: match.status,
        stage: match.stage,
        groupName: match.groupName ?? '',
        competition: match.season.competition.name,
        competitionId: match.season.competitionId,
        season: match.season.name,
        seasonId: match.seasonId,
        homeBetScore,
        awayBetScore,
        betStatus: getBetStatus(
          match.status,
          userBet
            ? { homeScore: userBet.homeScore, awayScore: userBet.awayScore }
            : null,
          { homeScore, awayScore },
        ),
        homeTeamLogoUrl: match.homeTeam.logoUrl?.trim() || null,
        awayTeamLogoUrl: match.awayTeam.logoUrl?.trim() || null,
      };
    });
  }
}

function getBetStatus(
  matchStatus: MatchStatus,
  bet: { homeScore: number; awayScore: number } | null,
  result: { homeScore: number; awayScore: number },
): MatchData['betStatus'] {
  if (!bet) {
    return 'UNSET';
  }

  if (matchStatus !== MatchStatus.FINISHED) {
    return 'SET';
  }

  if (
    bet.homeScore === result.homeScore &&
    bet.awayScore === result.awayScore
  ) {
    return 'WON';
  }

  const predictedOutcome = Math.sign(bet.homeScore - bet.awayScore);
  const actualOutcome = Math.sign(result.homeScore - result.awayScore);

  return predictedOutcome === actualOutcome ? 'RESULT' : 'LOST';
}
