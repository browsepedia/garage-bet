import { z as zod } from 'zod';

export const LeaderboardEntrySchema = zod.object({
  userId: zod.string(),
  name: zod.string(),
  avatarUrl: zod.string(),
  totalPoints: zod.number(),
  totalWins: zod.number(),
  totalLosses: zod.number(),
  totalResults: zod.number(),
  betCount: zod.number(),
  /** Points from championship final prediction (0–10 per season when settled). */
  finalBetPoints: zod.number(),
  winRate: zod.number(), // totalPoints /(totalBets * 3)
});

export type LeaderboardEntry = zod.infer<typeof LeaderboardEntrySchema>;

/** Leaderboard row plus global rank (1 = top). Returned by `GET /leaderboard/me` and `GET /leaderboard/user/:userId`. */
export const LeaderboardEntryWithRankSchema = LeaderboardEntrySchema.extend({
  rank: zod.number().int().positive(),
});

export type LeaderboardEntryWithRank = zod.infer<
  typeof LeaderboardEntryWithRankSchema
>;
