/**
 * Scoring for championship final prediction vs actual result.
 * - 10: both finalists correct (home/away slots) + exact score
 * - 7: both finalists correct (home/away) + correct outcome (W/D/L), not exact score
 * - 5: both finalist teams correct (either order)
 * - 2: exactly one finalist correct
 * - 0: otherwise
 *
 * 7/10 require predicted home/away to match actual home/away (not flipped).
 */
export type FinalBetPrediction = {
  predictedHomeTeamId: string;
  predictedAwayTeamId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
};

export type FinalBetActual = {
  finalHomeTeamId: string;
  finalAwayTeamId: string;
  finalHomeScore: number;
  finalAwayScore: number;
};

function outcome(home: number, away: number): -1 | 0 | 1 {
  if (home > away) return 1;
  if (home < away) return -1;
  return 0;
}

export function scoreFinalBet(
  pred: FinalBetPrediction,
  actual: FinalBetActual,
): number {
  const { finalHomeTeamId: ah, finalAwayTeamId: aa } = actual;
  const ph = pred.predictedHomeTeamId;
  const pa = pred.predictedAwayTeamId;

  const predSet = new Set([ph, pa]);
  const actualSet = new Set([ah, aa]);

  if (predSet.size !== 2 || actualSet.size !== 2) {
    return 0;
  }

  const bothTeamsUnordered =
    predSet.has(ah) && predSet.has(aa) && predSet.size === actualSet.size;

  const orderedCorrect = ph === ah && pa === aa;

  if (orderedCorrect) {
    if (
      pred.predictedHomeScore === actual.finalHomeScore &&
      pred.predictedAwayScore === actual.finalAwayScore
    ) {
      return 10;
    }
    if (
      outcome(pred.predictedHomeScore, pred.predictedAwayScore) ===
      outcome(actual.finalHomeScore, actual.finalAwayScore)
    ) {
      return 7;
    }
    return 5;
  }

  if (bothTeamsUnordered) {
    return 5;
  }

  const correctCount = [ph, pa].filter((id) => actualSet.has(id)).length;
  if (correctCount === 1) {
    return 2;
  }

  return 0;
}
