import type { MatchData } from '@garage-bet/models';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import {
  RefreshControl,
  SectionList,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatInUserTimezone } from '../utils/format-date';
import MatchCard from './MatchCard';

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

type MatchGroup = {
  key: string;
  stage: string;
  groupName: string;
  title: string;
  matches: MatchData[];
};

type MatchSection = {
  key: string;
  title: string;
  data: MatchData[];
};

function groupMatches(
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
  groups.sort((a, b) => {
    const oa = STAGE_SORT_ORDER[a.stage] ?? 999;
    const ob = STAGE_SORT_ORDER[b.stage] ?? 999;
    if (oa !== ob) return oa - ob;
    return a.groupName.localeCompare(b.groupName, undefined, {
      sensitivity: 'base',
    });
  });
  return groups;
}

export type MatchesSectionListProps = {
  matches: MatchData[];
  onSetBetClick: (match: MatchData) => void;
  listEmptyComponent?: ReactElement | (() => ReactElement) | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  groupByDate?: boolean;
};

export function MatchesSectionList({
  matches,
  onSetBetClick,
  listEmptyComponent = null,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  style,
  groupByDate = false,
}: MatchesSectionListProps) {
  const theme = useTheme();

  const sections = useMemo(
    (): MatchSection[] =>
      groupMatches(matches, groupByDate).map((group) => ({
        key: group.key,
        title: group.title,
        data: group.matches,
      })),
    [matches, groupByDate],
  );

  return (
    <SectionList<MatchData, MatchSection>
      style={[{ flex: 1 }, style]}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={[
        {
          paddingHorizontal: 16,
          paddingBottom: 32,
          flexGrow: 1,
        },
        contentContainerStyle,
      ]}
      renderItem={({ item }) => (
        <MatchCard match={item} onSetBetClick={onSetBetClick} />
      )}
      renderSectionHeader={({ section }) => (
        <View
          style={{
            backgroundColor: theme.colors.background,
            paddingBottom: 8,
          }}
        >
          <Text variant="titleSmall" style={{ color: '#a1a1aa' }}>
            {section.title}
          </Text>
        </View>
      )}
      ListEmptyComponent={listEmptyComponent ?? undefined}
    />
  );
}
