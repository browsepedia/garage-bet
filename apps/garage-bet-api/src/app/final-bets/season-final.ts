import { MatchStage } from '@prisma/client';
import { PrismaService } from '../services/prisma-service';
import { FinalBetActual } from './final-bet-scoring';

/**
 * Resolves the actual final result for one or more seasons.
 *
 * The source of truth is the FINAL match in the matches table — the row whose
 * `stage` is {@link MatchStage.FINAL}. The finalist teams are taken as soon as
 * that fixture exists (they decide the 2- and 5-point team tiers), while the
 * scores are used for the outcome/exact tiers only once they are recorded
 * (`finalHomeScore`/`finalAwayScore` may be null until the match is played).
 *
 * When a season has no FINAL match we fall back to the admin-entered `final*`
 * answer fields on the season itself.
 *
 * @param seasonIds Optional whitelist; omit to resolve finals for every season.
 * @returns Map keyed by seasonId. Seasons with no FINAL fixture are absent.
 */
export async function resolveSeasonFinals(
  prisma: PrismaService,
  seasonIds?: string[],
): Promise<Map<string, FinalBetActual>> {
  const seasonFilter = seasonIds ? { seasonId: { in: seasonIds } } : {};

  const finalMatches = await prisma.match.findMany({
    where: {
      stage: MatchStage.FINAL,
      ...seasonFilter,
    },
    select: {
      seasonId: true,
      homeTeamId: true,
      awayTeamId: true,
      homeScore: true,
      awayScore: true,
      kickoffAt: true,
    },
    // Most recent FINAL wins if a season somehow has more than one.
    orderBy: { kickoffAt: 'desc' },
  });

  const result = new Map<string, FinalBetActual>();
  for (const m of finalMatches) {
    if (result.has(m.seasonId)) continue;
    result.set(m.seasonId, {
      finalHomeTeamId: m.homeTeamId,
      finalAwayTeamId: m.awayTeamId,
      finalHomeScore: m.homeScore,
      finalAwayScore: m.awayScore,
    });
  }

  // Fallback: seasons with an admin-entered final answer but no FINAL match.
  const seasons = await prisma.season.findMany({
    where: {
      ...(seasonIds ? { id: { in: seasonIds } } : {}),
      finalHomeTeamId: { not: null },
      finalAwayTeamId: { not: null },
    },
    select: {
      id: true,
      finalHomeTeamId: true,
      finalAwayTeamId: true,
      finalHomeScore: true,
      finalAwayScore: true,
    },
  });
  for (const s of seasons) {
    if (result.has(s.id)) continue;
    result.set(s.id, {
      finalHomeTeamId: s.finalHomeTeamId as string,
      finalAwayTeamId: s.finalAwayTeamId as string,
      finalHomeScore: s.finalHomeScore,
      finalAwayScore: s.finalAwayScore,
    });
  }

  return result;
}
