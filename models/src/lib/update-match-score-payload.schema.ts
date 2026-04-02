import { z as zod } from 'zod';

export const UpdateMatchScorePayloadSchema = zod.object({
  homeScore: zod.number().int().min(0),
  awayScore: zod.number().int().min(0),
  isEnded: zod.boolean(),
});

export type UpdateMatchScorePayload = zod.infer<
  typeof UpdateMatchScorePayloadSchema
>;
