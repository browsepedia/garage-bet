import { z as zod } from 'zod';

export const MatchDataSchema = zod.object({
  id: zod.string(),
  homeTeam: zod.string(),
  awayTeam: zod.string(),
  homeTeamId: zod.string(),
  awayTeamId: zod.string(),
  homeScore: zod.number(),
  awayScore: zod.number(),
  kickoffAt: zod.string(),
  status: zod.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'CANCELED', 'POSTPONED']),
  stage: zod.string(),
  groupName: zod.string(),
  competition: zod.string(),
  competitionId: zod.string(),
  season: zod.string(),
  seasonId: zod.string(),
  homeBetScore: zod.number(),
  awayBetScore: zod.number(),
  betStatus: zod.enum(['WON', 'LOST', 'RESULT', 'UNSET', 'SET']),
});

export type MatchData = zod.infer<typeof MatchDataSchema>;
