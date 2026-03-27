import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../services/prisma-service';
import { scoreFinalBet } from './final-bet-scoring';

export type UpsertFinalBetDto = {
  predictedHomeTeamId: string;
  predictedAwayTeamId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
};

export type SetFinalAnswerDto = {
  finalHomeTeamId: string;
  finalAwayTeamId: string;
  finalHomeScore: number;
  finalAwayScore: number;
};

@Injectable()
export class FinalBetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async listSeasons() {
    return this.prisma.season.findMany({
      orderBy: [{ competitionId: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        year: true,
        finalBettingOpen: true,
        competition: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * True when the season belongs to the given competition and at least one
   * fixture kickoff is on or before now (server time).
   */
  async getSeasonScheduleStarted(
    competitionId: string,
    seasonId: string,
  ): Promise<{ hasStarted: boolean }> {
    const season = await this.prisma.season.findFirst({
      where: { id: seasonId, competitionId },
      select: { id: true },
    });

    if (!season) {
      throw new NotFoundException('Season not found for this competition');
    }

    const pastKickoff = await this.prisma.match.findFirst({
      where: {
        seasonId,
        kickoffAt: { lte: new Date() },
      },
      select: { id: true },
    });

    return { hasStarted: pastKickoff != null };
  }

  async listFinalBetsForSeason(
    seasonId: string,
    authorizationHeader?: string,
  ) {
    await this.authService.me(authorizationHeader);

    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: {
        id: true,
        finalHomeTeamId: true,
        finalAwayTeamId: true,
        finalHomeScore: true,
        finalAwayScore: true,
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    const bets = await this.prisma.finalPlayerBet.findMany({
      where: { seasonId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const teamIds = new Set<string>();
    for (const b of bets) {
      teamIds.add(b.predictedHomeTeamId);
      teamIds.add(b.predictedAwayTeamId);
    }

    const teams =
      teamIds.size === 0
        ? []
        : await this.prisma.team.findMany({
            where: { id: { in: [...teamIds] } },
            select: { id: true, name: true },
          });
    const teamById = new Map(teams.map((t) => [t.id, t]));

    const actual =
      season.finalHomeTeamId &&
      season.finalAwayTeamId &&
      season.finalHomeScore !== null &&
      season.finalHomeScore !== undefined &&
      season.finalAwayScore !== null &&
      season.finalAwayScore !== undefined
        ? {
            finalHomeTeamId: season.finalHomeTeamId,
            finalAwayTeamId: season.finalAwayTeamId,
            finalHomeScore: season.finalHomeScore,
            finalAwayScore: season.finalAwayScore,
          }
        : null;

    const rows = bets.map((bet) => {
      const homeTeam = teamById.get(bet.predictedHomeTeamId);
      const awayTeam = teamById.get(bet.predictedAwayTeamId);
      const displayName =
        bet.user.name?.trim() ||
        bet.user.email?.split('@')[0] ||
        `User ${bet.user.id.slice(0, 6)}`;
      const avatarUrl =
        bet.user.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName,
        )}&background=EA580C&color=ffffff&bold=true`;

      let awardedPoints: number | null = null;
      if (actual) {
        awardedPoints = scoreFinalBet(
          {
            predictedHomeTeamId: bet.predictedHomeTeamId,
            predictedAwayTeamId: bet.predictedAwayTeamId,
            predictedHomeScore: bet.predictedHomeScore,
            predictedAwayScore: bet.predictedAwayScore,
          },
          {
            finalHomeTeamId: actual.finalHomeTeamId,
            finalAwayTeamId: actual.finalAwayTeamId,
            finalHomeScore: actual.finalHomeScore,
            finalAwayScore: actual.finalAwayScore,
          },
        );
      }

      return {
        userId: bet.userId,
        displayName,
        avatarUrl,
        predictedHomeTeamName: homeTeam?.name ?? '—',
        predictedAwayTeamName: awayTeam?.name ?? '—',
        predictedHomeScore: bet.predictedHomeScore,
        predictedAwayScore: bet.predictedAwayScore,
        updatedAt: bet.updatedAt.toISOString(),
        awardedPoints,
      };
    });

    rows.sort((a, b) =>
      a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: 'base',
      }),
    );

    return rows;
  }

  async getFinalBetForSeason(seasonId: string, authorizationHeader?: string) {
    const user = await this.authService.me(authorizationHeader);

    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competition: true,
        finalHomeTeam: true,
        finalAwayTeam: true,
        teams: { include: { team: true } },
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    const myBet = await this.prisma.finalPlayerBet.findUnique({
      where: {
        seasonId_userId: { seasonId, userId: user.id },
      },
    });

    const teamOptions = season.teams.map((st) => ({
      id: st.team.id,
      name: st.team.name,
      shortName: st.team.shortName,
    }));

    const actual =
      season.finalHomeTeamId &&
      season.finalAwayTeamId &&
      season.finalHomeScore !== null &&
      season.finalHomeScore !== undefined &&
      season.finalAwayScore !== null &&
      season.finalAwayScore !== undefined
        ? {
            homeTeamId: season.finalHomeTeamId,
            awayTeamId: season.finalAwayTeamId,
            homeTeamName: season.finalHomeTeam?.name ?? '',
            awayTeamName: season.finalAwayTeam?.name ?? '',
            homeScore: season.finalHomeScore,
            awayScore: season.finalAwayScore,
          }
        : season.finalHomeTeamId && season.finalAwayTeamId
          ? {
              homeTeamId: season.finalHomeTeamId,
              awayTeamId: season.finalAwayTeamId,
              homeTeamName: season.finalHomeTeam?.name ?? '',
              awayTeamName: season.finalAwayTeam?.name ?? '',
              homeScore: null as number | null,
              awayScore: null as number | null,
            }
          : null;

    let awardedPoints: number | null = null;
    if (
      myBet &&
      actual &&
      actual.homeScore !== null &&
      actual.awayScore !== null
    ) {
      awardedPoints = scoreFinalBet(
        {
          predictedHomeTeamId: myBet.predictedHomeTeamId,
          predictedAwayTeamId: myBet.predictedAwayTeamId,
          predictedHomeScore: myBet.predictedHomeScore,
          predictedAwayScore: myBet.predictedAwayScore,
        },
        {
          finalHomeTeamId: actual.homeTeamId,
          finalAwayTeamId: actual.awayTeamId,
          finalHomeScore: actual.homeScore,
          finalAwayScore: actual.awayScore,
        },
      );
    }

    return {
      seasonId: season.id,
      competitionName: season.competition.name,
      seasonName: season.name,
      finalBettingOpen: season.finalBettingOpen,
      teamOptions,
      actual,
      myBet: myBet
        ? {
            predictedHomeTeamId: myBet.predictedHomeTeamId,
            predictedAwayTeamId: myBet.predictedAwayTeamId,
            predictedHomeScore: myBet.predictedHomeScore,
            predictedAwayScore: myBet.predictedAwayScore,
            updatedAt: myBet.updatedAt.toISOString(),
          }
        : null,
      awardedPoints,
    };
  }

  async upsertFinalBet(
    seasonId: string,
    dto: UpsertFinalBetDto,
    authorizationHeader?: string,
  ) {
    const user = await this.authService.me(authorizationHeader);

    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { teams: { select: { teamId: true } } },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (!season.finalBettingOpen) {
      throw new ForbiddenException('Final betting is closed for this season');
    }

    if (dto.predictedHomeTeamId === dto.predictedAwayTeamId) {
      throw new BadRequestException('Home and away teams must differ');
    }

    const allowed = new Set(season.teams.map((t) => t.teamId));
    if (
      !allowed.has(dto.predictedHomeTeamId) ||
      !allowed.has(dto.predictedAwayTeamId)
    ) {
      throw new BadRequestException(
        'Both teams must participate in this season',
      );
    }

    for (const s of [dto.predictedHomeScore, dto.predictedAwayScore]) {
      if (!Number.isInteger(s) || s < 0) {
        throw new BadRequestException('Scores must be non-negative integers');
      }
    }

    const bet = await this.prisma.finalPlayerBet.upsert({
      where: {
        seasonId_userId: { seasonId, userId: user.id },
      },
      create: {
        seasonId,
        userId: user.id,
        predictedHomeTeamId: dto.predictedHomeTeamId,
        predictedAwayTeamId: dto.predictedAwayTeamId,
        predictedHomeScore: dto.predictedHomeScore,
        predictedAwayScore: dto.predictedAwayScore,
      },
      update: {
        predictedHomeTeamId: dto.predictedHomeTeamId,
        predictedAwayTeamId: dto.predictedAwayTeamId,
        predictedHomeScore: dto.predictedHomeScore,
        predictedAwayScore: dto.predictedAwayScore,
      },
    });

    return {
      predictedHomeTeamId: bet.predictedHomeTeamId,
      predictedAwayTeamId: bet.predictedAwayTeamId,
      predictedHomeScore: bet.predictedHomeScore,
      predictedAwayScore: bet.predictedAwayScore,
      updatedAt: bet.updatedAt.toISOString(),
    };
  }

  async setFinalAnswer(seasonId: string, dto: SetFinalAnswerDto) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { teams: { select: { teamId: true } } },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (dto.finalHomeTeamId === dto.finalAwayTeamId) {
      throw new BadRequestException('Home and away teams must differ');
    }

    const allowed = new Set(season.teams.map((t) => t.teamId));
    if (!allowed.has(dto.finalHomeTeamId) || !allowed.has(dto.finalAwayTeamId)) {
      throw new BadRequestException(
        'Final teams must participate in this season',
      );
    }

    for (const s of [dto.finalHomeScore, dto.finalAwayScore]) {
      if (!Number.isInteger(s) || s < 0) {
        throw new BadRequestException('Scores must be non-negative integers');
      }
    }

    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        finalHomeTeamId: dto.finalHomeTeamId,
        finalAwayTeamId: dto.finalAwayTeamId,
        finalHomeScore: dto.finalHomeScore,
        finalAwayScore: dto.finalAwayScore,
      },
    });

    return { ok: true as const };
  }

  async setFinalBettingOpen(seasonId: string, open: boolean) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    await this.prisma.season.update({
      where: { id: seasonId },
      data: { finalBettingOpen: open },
    });
    return { ok: true as const, finalBettingOpen: open };
  }
}
