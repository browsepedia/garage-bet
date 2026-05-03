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
import { useUserProfileQuery } from '../queries/user-profile.query';
import { AppTheme } from '../theme';
import {
  groupMatches,
  groupMatchesByChampionship,
  MatchSection,
} from '../utils/match-utils';
import MatchCard from './MatchCard';

export type MatchesSectionListProps = {
  matches: MatchData[];
  onSetBetClick: (match: MatchData) => void;
  onUpdateScoreClick?: (match: MatchData) => void;
  listEmptyComponent?: ReactElement | (() => ReactElement) | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  groupByDate?: boolean;
  /** When true, sections are competition — season (ignores `groupByDate`). */
  groupByChampionship?: boolean;
  showStanding?: boolean;
  showChampionship?: boolean;
  showOnlyStartTime?: boolean;
};

export function MatchesSectionList({
  matches,
  onSetBetClick,
  onUpdateScoreClick,
  listEmptyComponent = null,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  style,
  groupByDate = false,
  groupByChampionship = false,
  showStanding = true,
  showChampionship = true,
  showOnlyStartTime = false,
}: MatchesSectionListProps) {
  const theme = useTheme<AppTheme>();
  const { data: me } = useUserProfileQuery();
  const sections = useMemo((): MatchSection[] => {
    const grouped = groupByChampionship
      ? groupMatchesByChampionship(matches)
      : groupMatches(matches, groupByDate);
    return grouped.map((group) => ({
      key: group.key,
      title: group.title,
      data: group.matches,
    }));
  }, [matches, groupByDate, groupByChampionship]);

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
          paddingHorizontal: theme.spacing(2),
          paddingBottom: theme.spacing(4),
          flexGrow: 1,
        },
        contentContainerStyle,
      ]}
      renderItem={({ item }) => (
        <MatchCard
          isAdminUser={me?.isAdmin}
          match={item}
          showStanding={showStanding}
          showChampionship={showChampionship}
          onSetBetClick={onSetBetClick}
          onUpdateScoreClick={onUpdateScoreClick}
          showOnlyStartTime={showOnlyStartTime}
        />
      )}
      renderSectionHeader={({ section }) => (
        <View
          style={{
            backgroundColor: theme.colors.background,
            paddingBottom: theme.spacing(1),
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
