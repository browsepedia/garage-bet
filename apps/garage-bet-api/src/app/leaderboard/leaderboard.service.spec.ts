import { MatchStage, MatchStatus } from '@prisma/client';
import { LeaderboardService } from './leaderboard.service';

/**
 * Reproduces the real scenario: a FINISHED match with stage = FINAL exists,
 * a user's FinalPlayerBet matches it exactly, and we assert the leaderboard
 * actually carries the final-bet points.
 */
function makePrismaMock(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'u1',
          name: 'Alice',
          avatarUrl: null,
          email: 'alice@example.com',
          bets: [],
        },
      ]),
    },
    finalPlayerBet: {
      findMany: jest.fn().mockResolvedValue([
        {
          userId: 'u1',
          seasonId: 's1',
          predictedHomeTeamId: 't1',
          predictedAwayTeamId: 't2',
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
      ]),
    },
    match: {
      findMany: jest.fn().mockResolvedValue([
        {
          seasonId: 's1',
          homeTeamId: 't1',
          awayTeamId: 't2',
          homeScore: 2,
          awayScore: 1,
          kickoffAt: new Date('2026-07-01T18:00:00Z'),
          stage: MatchStage.FINAL,
          status: MatchStatus.FINISHED,
        },
      ]),
      count: jest.fn().mockResolvedValue(0),
    },
    season: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as never;
}

describe('LeaderboardService final-bet points', () => {
  it('adds final-bet points from the FINISHED stage=FINAL match', async () => {
    const service = new LeaderboardService(makePrismaMock());

    const board = await service.getLeaderboard();
    const alice = board.find((e) => e.userId === 'u1');

    expect(alice?.finalBetPoints).toBe(10);
    expect(alice?.totalPoints).toBe(10);
  });
});
