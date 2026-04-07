import { MatchData, UpdateMatchScorePayload } from '@garage-bet/models';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchStage, MatchStatus } from '@prisma/client';
import { toDate } from 'date-fns-tz';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../services/prisma-service';

const LOCAL_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function addCalendarDaysToYyyyMmDd(yyyyMmDd: string, delta: number): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const u = new Date(Date.UTC(y, m - 1, d + delta));
  const yy = u.getUTCFullYear();
  const mm = String(u.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(u.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function utcRangeForLocalCalendarDay(
  dateYyyyMmDd: string,
  timeZone: string,
): { start: Date; endExclusive: Date } {
  if (!LOCAL_DAY_RE.test(dateYyyyMmDd)) {
    throw new BadRequestException('Invalid date; expected yyyy-MM-dd');
  }
  if (!timeZone?.trim()) {
    throw new BadRequestException('timeZone is required (IANA identifier)');
  }
  const start = toDate(`${dateYyyyMmDd}T00:00:00.000`, { timeZone });
  const nextDay = addCalendarDaysToYyyyMmDd(dateYyyyMmDd, 1);
  const endExclusive = toDate(`${nextDay}T00:00:00.000`, { timeZone });
  if (Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime())) {
    throw new BadRequestException('Invalid date or time zone');
  }
  return { start, endExclusive };
}

type MatchWithUserBet = {
  id: string;
  seasonId: string;
  kickoffAt: Date;
  status: MatchStatus;
  stage: MatchStage;
  groupName: string | null;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  season: {
    name: string;
    competitionId: string;
    competition: { name: string };
  };
  bets: { homeScore: number; awayScore: number }[];
};

function mapMatchToDto(match: MatchWithUserBet): MatchData {
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
    venue: match.venue ?? '',
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
}

@Injectable()
export class MatchesService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private userBetInclude(userId: string) {
    return {
      season: {
        include: {
          competition: true,
        },
      },
      homeTeam: true,
      awayTeam: true,
      bets: {
        where: { userId },
        take: 1,
      },
    } as const;
  }

  async getMatches(authorizationHeader?: string): Promise<MatchData[]> {
    const user = await this.authService.me(authorizationHeader);

    const matches = await this.prisma.match.findMany({
      include: this.userBetInclude(user.id),
      orderBy: {
        kickoffAt: 'asc',
      },
    });

    return matches.map((match) => mapMatchToDto(match));
  }

  async getMatchesForSeason(
    seasonId: string,
    authorizationHeader?: string,
  ): Promise<MatchData[]> {
    const user = await this.authService.me(authorizationHeader);

    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    const matches = await this.prisma.match.findMany({
      where: { seasonId },
      include: this.userBetInclude(user.id),
      orderBy: {
        kickoffAt: 'asc',
      },
    });

    return matches.map((match) => mapMatchToDto(match));
  }

  async getMatchesForLocalDay(
    dateYyyyMmDd: string,
    timeZone: string,
    authorizationHeader?: string,
  ): Promise<MatchData[]> {
    const user = await this.authService.me(authorizationHeader);
    const { start, endExclusive } = utcRangeForLocalCalendarDay(
      dateYyyyMmDd,
      timeZone,
    );

    const matches = await this.prisma.match.findMany({
      where: {
        kickoffAt: {
          gte: start,
          lt: endExclusive,
        },
      },
      include: this.userBetInclude(user.id),
      orderBy: {
        kickoffAt: 'asc',
      },
    });

    return matches.map((match) => mapMatchToDto(match));
  }

  async listBetsForMatch(matchId: string, authorizationHeader?: string) {
    await this.authService.me(authorizationHeader);

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        homeScore: true,
        awayScore: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const bets = await this.prisma.bet.findMany({
      where: { matchId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const result = { homeScore, awayScore };

    const rows = bets.map((bet) => {
      const displayName =
        bet.user.name?.trim() ||
        bet.user.email?.split('@')[0] ||
        `User ${bet.user.id.slice(0, 6)}`;
      const avatarUrl =
        bet.user.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName,
        )}&background=EA580C&color=ffffff&bold=true`;

      return {
        userId: bet.userId,
        displayName,
        avatarUrl,
        homeScore: bet.homeScore,
        awayScore: bet.awayScore,
        betStatus: getBetStatus(
          match.status,
          { homeScore: bet.homeScore, awayScore: bet.awayScore },
          result,
        ),
      };
    });

    rows.sort((a, b) =>
      a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: 'base',
      }),
    );

    return rows;
  }

  async updateMatchScore(
    matchId: string,
    payload: UpdateMatchScorePayload,
    authorizationHeader?: string,
  ) {
    await this.authService.meAdmin(authorizationHeader);

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const status = payload.isEnded ? MatchStatus.FINISHED : MatchStatus.LIVE;

    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
        status,
      },
    });

    return { ok: true as const };
  }
}

export function getBetStatus(
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
