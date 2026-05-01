import type { UserStats } from '@garage-bet/models';
import type { RadarAxis } from '../components/RadarChart';

function safe(v: number): number {
  return Number.isFinite(v) && v >= 0 ? Math.min(1, v) : 0;
}

/** Normalised axes [0,1] for the stats radar (same metrics as the single-user chart). */
export function buildRadarAxes(s: UserStats): RadarAxis[] {
  const bets = s.bets || 1;
  const maxPts = s.maxPoints || 1;
  const totalFinished = s.totalFinishedMatches || 1;
  return [
    { label: 'PP', value: safe(s.points / maxPts) },
    { label: 'Exact', value: safe(s.wins / bets) },
    { label: 'Result', value: safe(s.results / bets) },
    { label: 'Lost', value: safe(s.losses / bets) },
    { label: 'Coverage', value: safe(s.bets / totalFinished) },
  ];
}
