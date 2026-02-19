import { z as zod } from 'zod';

export const SetBetPayloadSchema = zod.object({
  matchId: zod.string(),
  homeScore: zod.number(),
  awayScore: zod.number(),
});

export type SetBetPayload = zod.infer<typeof SetBetPayloadSchema>;
