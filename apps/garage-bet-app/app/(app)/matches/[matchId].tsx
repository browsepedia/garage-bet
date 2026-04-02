import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { MatchBetListItem } from '@garage-bet/models';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import BetCard from '../../../components/BetCard';
import { Button } from '../../../components/Button';
import PressableCheckbox from '../../../components/PressableCheckbox';
import { Screen } from '../../../components/Screen';
import { useMatchBetsQuery } from '../../../queries/match-bets.query';
import { useMatchesQuery } from '../../../queries/matches.query';
import { useUserProfileQuery } from '../../../queries/user-profile.query';
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
  const theme = useTheme();
  const { data: me } = useUserProfileQuery();
  const { data: matches, refetch } = useMatchesQuery();

  const {
    data: matchBets,
    isPending: betsPending,
    isFetching: betsFetching,
    isError: betsError,
    error: betsQueryError,
    refetch: refetchBets,
  } = useMatchBetsQuery(matchId);

  const match = matches?.find((m) => m.id === matchId);
  const [groupByOutcome, setGroupByOutcome] = useState(false);

  const betStatusColor = useBetStatusColor(
    (match?.betStatus === 'UNSET'
      ? 'SET'
      : match?.betStatus) as MatchBetListItem['betStatus'],
  );

  const sections = useMemo(
    () => buildBetSections(matchBets, groupByOutcome),
    [matchBets, groupByOutcome],
  );

  if (!match) {
    return (
      <Screen style={{ justifyContent: 'center', gap: 16, padding: 16 }}>
        <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
          Match not found. It may have been removed or the list is out of date.
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Refresh
        </Button>
        <Button mode="text" onPress={() => router.back()}>
          Go back
        </Button>
      </Screen>
    );
  }

  const score = (n: number) => (Number.isFinite(n) ? String(n) : '—');

  const listHeader = (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Text variant="bodyLarge" style={{ flex: 1, textAlign: 'right' }}>
          {score(match.homeScore)}
        </Text>
        <Text style={{ width: 24, textAlign: 'center', opacity: 0.5 }}>—</Text>
        <Text variant="bodyLarge" style={{ flex: 1, textAlign: 'left' }}>
          {score(match.awayScore)}
        </Text>
      </View>

      {match.betStatus !== 'UNSET' && (
        <View style={{ gap: 8, position: 'relative', marginTop: 12 }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              paddingHorizontal: 8,
              backgroundColor: betStatusColor,
              borderRadius: 999,
            }}
          >
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurface,
                backgroundColor: betStatusColor,
              }}
            >
              {match.betStatus}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                flex: 1,
                textAlign: 'right',
                color: theme.colors.onSurfaceDisabled,
              }}
            >
              {score(match.homeBetScore)}
            </Text>
            <Text
              style={{
                width: 24,
                textAlign: 'center',
                color: theme.colors.onSurfaceDisabled,
              }}
            >
              —
            </Text>
            <Text
              variant="titleMedium"
              style={{
                flex: 1,
                textAlign: 'left',
                color: theme.colors.onSurfaceDisabled,
              }}
            >
              {score(match.awayBetScore)}
            </Text>
          </View>
        </View>
      )}

      <PressableCheckbox
        checked={groupByOutcome}
        onPress={() => setGroupByOutcome((v) => !v)}
        label="Group by outcome"
      />

      <PressableCheckbox
        checked={groupByOutcome}
        onPress={() => setGroupByOutcome((v) => !v)}
        label="Group by outcome"
      />

      <PressableCheckbox
        checked={groupByOutcome}
        onPress={() => setGroupByOutcome((v) => !v)}
        label="Group by outcome"
      />
    </View>
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 16, position: 'relative' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingLeft: 36,
          }}
        >
          <Text
            style={{ flex: 1, flexShrink: 0, textAlign: 'right' }}
            variant="bodyLarge"
          >
            {match.homeTeam}
          </Text>
          <Text
            style={{
              width: 24,
              textAlign: 'center',
              opacity: 0.7,
              flexShrink: 0,
            }}
          >
            —
          </Text>
          <Text style={{ flex: 1, flexShrink: 0 }} variant="bodyLarge">
            {match.awayTeam}
          </Text>
        </View>

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
            top: 0,
            left: 0,
            zIndex: 2,
            elevation: 4,
            padding: 8,
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
          ListHeaderComponent={listHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32,
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
                  paddingTop: 12,
                  paddingBottom: 8,
                }}
              >
                <Text variant="titleSmall" style={{ color: '#a1a1aa' }}>
                  {section.title}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            betsPending ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : betsError ? (
              <View style={{ gap: 12, marginTop: 8 }}>
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
              <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
                No bets on this match yet.
              </Text>
            )
          }
        />
      </View>
    </Screen>
  );
}
