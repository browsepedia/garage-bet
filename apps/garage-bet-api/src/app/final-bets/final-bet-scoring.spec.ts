import { scoreFinalBet } from './final-bet-scoring';

const actual = {
  finalHomeTeamId: 'h1',
  finalAwayTeamId: 'a1',
  finalHomeScore: 2,
  finalAwayScore: 1,
};

describe('scoreFinalBet', () => {
  it('returns 10 for exact ordered match + score', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'h1',
          predictedAwayTeamId: 'a1',
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
        actual,
      ),
    ).toBe(10);
  });

  it('returns 7 for ordered teams + correct outcome only', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'h1',
          predictedAwayTeamId: 'a1',
          predictedHomeScore: 3,
          predictedAwayScore: 0,
        },
        actual,
      ),
    ).toBe(7);
  });

  it('returns 5 for ordered teams + wrong outcome', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'h1',
          predictedAwayTeamId: 'a1',
          predictedHomeScore: 0,
          predictedAwayScore: 2,
        },
        actual,
      ),
    ).toBe(5);
  });

  it('returns 5 for both teams but swapped home/away', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'a1',
          predictedAwayTeamId: 'h1',
          predictedHomeScore: 1,
          predictedAwayScore: 2,
        },
        actual,
      ),
    ).toBe(5);
  });

  it('returns 2 for one finalist correct', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'h1',
          predictedAwayTeamId: 'x',
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
        actual,
      ),
    ).toBe(2);
  });

  it('returns 0 for no overlap', () => {
    expect(
      scoreFinalBet(
        {
          predictedHomeTeamId: 'x',
          predictedAwayTeamId: 'y',
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
        actual,
      ),
    ).toBe(0);
  });
});
