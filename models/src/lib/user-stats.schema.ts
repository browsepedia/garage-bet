import { z as zod } from 'zod';

export const UserStatsSchema = zod.object({
  userId: zod.string(),
  name: zod.string(),
  avatarUrl: zod.string(),
  /** Total points earned (match bets + final bet bonus). */
  points: zod.number(),
  /** Maximum achievable points from finished match bets (betCount × 3). */
  maxPoints: zod.number(),
  /** Number of bets placed on finished matches. */
  bets: zod.number(),
  /** Total finished matches in the system (used for coverage & overall win rate). */
  totalFinishedMatches: zod.number(),
  /** 1-based position in the global leaderboard. */
  rank: zod.number().int().positive(),
  /** Total number of players on the leaderboard. */
  totalPlayers: zod.number().int().positive(),
  wins: zod.number(),
  results: zod.number(),
  losses: zod.number(),
  finalBetPoints: zod.number(),
});

export type UserStats = zod.infer<typeof UserStatsSchema>;
