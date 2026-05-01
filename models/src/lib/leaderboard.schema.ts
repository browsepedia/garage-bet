import { z as zod } from 'zod';

export const LeaderboardEntrySchema = zod.object({
  userId: zod.string(),
  name: zod.string(),
  avatarUrl: zod.string(),
  totalPoints: zod.number(),
  /** Total bets in which the prediction equals the match score */
  totalWins: zod.number(),
  /** Total bets in which the prediction is incorrect and the outcome is also incorrect */
  totalLosses: zod.number(),
  /** Total bets in which the prediction is incorrect and the outcome is correct */
  totalResults: zod.number(),
  /** Bets on matches with status FINISHED (same set used for wins / results / losses). */
  betCount: zod.number(),
  /** Points from championship final prediction (0–10 per season when settled). */
  finalBetPoints: zod.number(),
  /** Match points only / (betCount × 3); 0 if betCount is 0. */
  winRate: zod.number(),
});

export type LeaderboardEntry = zod.infer<typeof LeaderboardEntrySchema>;

/** Leaderboard row plus global rank (1 = top). Returned by `GET /leaderboard/me` and `GET /leaderboard/user/:userId`. */
export const LeaderboardEntryWithRankSchema = LeaderboardEntrySchema.extend({
  rank: zod.number().int().positive(),
});

export type LeaderboardEntryWithRank = zod.infer<
  typeof LeaderboardEntryWithRankSchema
>;
