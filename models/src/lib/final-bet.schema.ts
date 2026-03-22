import { z as zod } from 'zod';

export const SeasonListItemSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  year: zod.number().nullable(),
  finalBettingOpen: zod.boolean(),
  competition: zod.object({
    id: zod.string(),
    name: zod.string(),
    slug: zod.string(),
  }),
});

export type SeasonListItem = zod.infer<typeof SeasonListItemSchema>;

export const FinalBetTeamOptionSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  shortName: zod.string().nullable(),
});

export type FinalBetTeamOption = zod.infer<typeof FinalBetTeamOptionSchema>;

export const FinalBetActualSchema = zod.object({
  homeTeamId: zod.string(),
  awayTeamId: zod.string(),
  homeTeamName: zod.string(),
  awayTeamName: zod.string(),
  homeScore: zod.number().nullable(),
  awayScore: zod.number().nullable(),
});

export const FinalBetContextSchema = zod.object({
  seasonId: zod.string(),
  competitionName: zod.string(),
  seasonName: zod.string(),
  finalBettingOpen: zod.boolean(),
  teamOptions: zod.array(FinalBetTeamOptionSchema),
  actual: FinalBetActualSchema.nullable(),
  myBet: zod
    .object({
      predictedHomeTeamId: zod.string(),
      predictedAwayTeamId: zod.string(),
      predictedHomeScore: zod.number(),
      predictedAwayScore: zod.number(),
      updatedAt: zod.string(),
    })
    .nullable(),
  awardedPoints: zod.number().nullable(),
});

export type FinalBetContext = zod.infer<typeof FinalBetContextSchema>;

export const UpsertFinalBetPayloadSchema = zod.object({
  predictedHomeTeamId: zod.string().min(1),
  predictedAwayTeamId: zod.string().min(1),
  predictedHomeScore: zod.number().int().min(0),
  predictedAwayScore: zod.number().int().min(0),
});

export type UpsertFinalBetPayload = zod.infer<typeof UpsertFinalBetPayloadSchema>;

export const FinalBetListItemSchema = zod.object({
  userId: zod.string(),
  displayName: zod.string(),
  avatarUrl: zod.string(),
  predictedHomeTeamName: zod.string(),
  predictedAwayTeamName: zod.string(),
  predictedHomeScore: zod.number(),
  predictedAwayScore: zod.number(),
  updatedAt: zod.string(),
  awardedPoints: zod.number().nullable(),
});

export type FinalBetListItem = zod.infer<typeof FinalBetListItemSchema>;
