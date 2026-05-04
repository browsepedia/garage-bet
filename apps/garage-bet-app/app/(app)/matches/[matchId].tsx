import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { MatchBetListItem, MatchData } from '@garage-bet/models';
import PressableCheckbox from 'apps/garage-bet-app/components/PressableCheckbox';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import BetCard from '../../../components/BetCard';
import { Button } from '../../../components/Button';
import MatchCard from '../../../components/MatchCard';
import { Screen } from '../../../components/Screen';
import { useMatchBetsQuery } from '../../../queries/match-bets.query';
import { useMatchesQuery } from '../../../queries/matches.query';
import { useUserProfileQuery } from '../../../queries/user-profile.query';
import { AppTheme } from '../../../theme';
import { useBetStatusColor } from '../../../utils/use-bet-status-color';

type BetSection = {
  key: string;
  title: string;
  data: MatchBetListItem[];
};

function sortByDisplayName(a: MatchBetListItem, b: MatchBetListItem) {
  return a.displayName.localeCompare(b.displayName, undefined, {
    sensitivity: 'base',
  });
}

const useStyles = () => {
  const theme = useTheme<AppTheme>();

  return StyleSheet.create({
    matchVsRowStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    vsDashStyle: {
      width: 24,
      flexShrink: 0,
      textAlign: 'center' as const,
    },
    vsSideStyle: {
      flex: 1,
      minWidth: 0,
    },
  });
};

/** Section order when grouping: Won first, Results second, Lost last; Pending before Lost. */
const OUTCOME_SECTIONS: {
  key: string;
  title: string;
  status: MatchBetListItem['betStatus'];
}[] = [
  { key: 'won', title: 'Won', status: 'WON' },
  { key: 'results', title: 'Results', status: 'RESULT' },
  { key: 'pending', title: 'Pending', status: 'SET' },
  { key: 'lost', title: 'Lost', status: 'LOST' },
];

function buildBetSections(
  bets: MatchBetListItem[] | undefined,
  groupByOutcome: boolean,
): BetSection[] {
  const list = [...(bets ?? [])];
  if (!groupByOutcome) {
    list.sort(sortByDisplayName);
    return [{ key: 'all', title: '', data: list }];
  }

  const sections: BetSection[] = [];
  for (const spec of OUTCOME_SECTIONS) {
    const data = list
      .filter((b) => b.betStatus === spec.status)
      .sort(sortByDisplayName);
    if (data.length) {
      sections.push({ key: spec.key, title: spec.title, data });
    }
  }
  return sections;
}

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const theme = useTheme<AppTheme>();
  const { data: me } = useUserProfileQuery();
  const { data: matches, isPending: matchesPending } = useMatchesQuery('all');
  const styles = useStyles();

  const {
    data: matchBets,
    isPending: betsPending,
    isFetching: betsFetching,
    isError: betsError,
    error: betsQueryError,
    refetch: refetchBets,
  } = useMatchBetsQuery(matchId);

  const match = useMemo(
    () => matches?.find((m) => m.id === matchId) as MatchData,
    [matches, matchId],
  );

  const [groupByOutcome, setGroupByOutcome] = useState(true);

  const betStatusColor = useBetStatusColor(
    (match?.betStatus === 'UNSET'
      ? 'SET'
      : match?.betStatus) as MatchBetListItem['betStatus'],
  );

  const sections = useMemo(
    () => buildBetSections(matchBets, groupByOutcome),
    [matchBets, groupByOutcome],
  );

  const isLoading = matchesPending || betsPending || betsFetching;

  const score = (n: number) => (Number.isFinite(n) ? String(n) : '—');

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View
        style={{ paddingHorizontal: theme.spacing(2), position: 'relative' }}
      >
        {match && <MatchCard match={match} />}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/matches');
            }
          }}
          style={{
            position: 'absolute',
            top: theme.spacing(1),
            left: theme.spacing(2),
            zIndex: 2,
            elevation: 4,
            padding: theme.spacing(1),
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#f1f5f9"
          />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: theme.spacing(2) }}>
        <PressableCheckbox
          checked={groupByOutcome}
          onPress={() => setGroupByOutcome((v) => !v)}
          label="Group by outcome"
        />
      </View>

      <View style={{ flex: 1 }}>
        <SectionList<MatchBetListItem, BetSection>
          sections={sections}
          keyExtractor={(item) => item.userId}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl
              refreshing={betsFetching ?? false}
              onRefresh={() => refetchBets()}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: theme.spacing(2),
            paddingBottom: theme.spacing(4),
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <BetCard item={item} isCurrentUser={item.userId === me?.id} />
          )}
          renderSectionHeader={({ section }) =>
            section.title ? (
              <View
                style={{
                  backgroundColor: theme.colors.background,
                  paddingTop: theme.spacing(1),
                  paddingBottom: theme.spacing(1),
                }}
              >
                <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
                  {section.title}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={{ marginTop: theme.spacing(2) }} />
            ) : betsError ? (
              <View
                style={{ gap: theme.spacing(1), marginTop: theme.spacing(1) }}
              >
                <Text variant="bodyMedium" style={{ color: '#fca5a5' }}>
                  {betsQueryError instanceof Error
                    ? betsQueryError.message
                    : 'Could not load bets.'}
                </Text>
                <Button mode="outlined" onPress={() => refetchBets()}>
                  Retry
                </Button>
              </View>
            ) : (
              <Text
                variant="bodySmall"
                style={{
                  color: '#a1a1aa',
                  textAlign: 'center',
                  marginTop: theme.spacing(2),
                }}
              >
                No bets on this match yet.
              </Text>
            )
          }
        />
      </View>
    </Screen>
  );
}
