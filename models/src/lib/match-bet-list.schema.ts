import { z as zod } from 'zod';

export const MatchBetListItemSchema = zod.object({
  userId: zod.string(),
  displayName: zod.string(),
  avatarUrl: zod.string(),
  homeScore: zod.number(),
  awayScore: zod.number(),
  betStatus: zod.enum(['WON', 'LOST', 'RESULT', 'SET']),
});

export type MatchBetListItem = zod.infer<typeof MatchBetListItemSchema>;
