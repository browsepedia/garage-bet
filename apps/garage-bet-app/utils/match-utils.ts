import type { MatchData } from '@garage-bet/models';
import { formatInUserTimezone } from './format-date';

export function hasMatchStarted(match: MatchData): boolean {
  if (match.status === 'LIVE' || match.status === 'FINISHED') {
    return true;
  }
  const kickoffMs = Date.parse(match.kickoffAt);
  if (Number.isNaN(kickoffMs)) {
    return false;
  }
  return kickoffMs <= Date.now();
}

export type MatchGroup = {
  key: string;
  stage: string;
  groupName: string;
  title: string;
  matches: MatchData[];
};

export type MatchSection = {
  key: string;
  title: string;
  data: MatchData[];
};

export function groupMatches(
  matches: MatchData[],
  groupByDate: boolean,
): MatchGroup[] {
  const byKey = new Map<string, MatchData[]>();

  for (const m of matches) {
    if (groupByDate) {
      const key = formatInUserTimezone(m.kickoffAt, 'EEEE, MMMM d, yyyy');
      let bucket = byKey.get(key);
      if (!bucket) {
        bucket = [];
        byKey.set(key, bucket);
      }
      bucket.push(m);
    } else {
      const gn = m.groupName?.trim() ?? '';
      const key = `${m.stage}\0${gn}`;
      let bucket = byKey.get(key);
      if (!bucket) {
        bucket = [];
        byKey.set(key, bucket);
      }
      bucket.push(m);
    }
  }

  for (const list of byKey.values()) {
    list.sort((a, b) => Date.parse(a.kickoffAt) - Date.parse(b.kickoffAt));
  }

  const groups: MatchGroup[] = [];
  for (const [key, list] of byKey) {
    if (!list.length) continue;
    const first = list[0];
    const gn = first.groupName?.trim() ?? '';
    groups.push({
      key,
      stage: first.stage,
      groupName: gn,
      title: groupByDate
        ? formatInUserTimezone(first.kickoffAt, 'EEEE, MMMM d, yyyy')
        : stageGroupTitle(first.stage, first.groupName),
      matches: list,
    });
  }
  if (groupByDate) {
    groups.sort(
      (a, b) =>
        Date.parse(a.matches[0].kickoffAt) - Date.parse(b.matches[0].kickoffAt),
    );
  } else {
    groups.sort((a, b) => {
      const oa = STAGE_SORT_ORDER[a.stage] ?? 999;
      const ob = STAGE_SORT_ORDER[b.stage] ?? 999;
      if (oa !== ob) return oa - ob;
      return a.groupName.localeCompare(b.groupName, undefined, {
        sensitivity: 'base',
      });
    });
  }
  return groups;
}

/** Group by competition + season; matches inside each group sorted by kickoff. */
export function groupMatchesByChampionship(matches: MatchData[]): MatchGroup[] {
  const byKey = new Map<string, MatchData[]>();

  for (const m of matches) {
    const key = `${m.competitionId}\0${m.seasonId}`;
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = [];
      byKey.set(key, bucket);
    }
    bucket.push(m);
  }

  for (const list of byKey.values()) {
    list.sort((a, b) => Date.parse(a.kickoffAt) - Date.parse(b.kickoffAt));
  }

  const groups: MatchGroup[] = [];
  for (const [key, list] of byKey) {
    if (!list.length) continue;
    const first = list[0];
    groups.push({
      key,
      stage: first.stage,
      groupName: first.groupName?.trim() ?? '',
      title: `${first.competition} — ${first.season}`,
      matches: list,
    });
  }

  groups.sort((a, b) => {
    const ca = a.matches[0].competition.localeCompare(
      b.matches[0].competition,
      undefined,
      { sensitivity: 'base' },
    );
    if (ca !== 0) return ca;
    return a.matches[0].season.localeCompare(b.matches[0].season, undefined, {
      sensitivity: 'base',
    });
  });

  return groups;
}

/** Same order as `MatchStage` in Prisma (knockout progression). */
const STAGE_SORT_ORDER: Record<string, number> = {
  LEAGUE: 0,
  GROUP: 1,
  ROUND_OF_32: 2,
  ROUND_OF_16: 3,
  QUARTER_FINAL: 4,
  SEMI_FINAL: 5,
  THIRD_PLACE: 6,
  FINAL: 7,
};

function formatStageTitle(stage: string): string {
  return stage
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function stageGroupTitle(stage: string, groupName: string): string {
  const stagePart = formatStageTitle(stage);
  const g = groupName?.trim();
  return g ? `${stagePart} — ${g}` : stagePart;
}
