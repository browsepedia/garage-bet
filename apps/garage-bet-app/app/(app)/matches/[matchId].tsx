import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { MatchBetListItem } from '@garage-bet/models';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { useMatchBetsQuery } from '../../../queries/match-bets.query';
import { useMatchesQuery } from '../../../queries/matches.query';
import { useUserProfileQuery } from '../../../queries/user-profile.query';

function betStatusLabel(status: MatchBetListItem['betStatus']): string {
  switch (status) {
    case 'WON':
      return 'Exact score';
    case 'LOST':
      return 'Wrong';
    case 'RESULT':
      return 'Right result';
    case 'SET':
      return 'Pending';
    default:
      return status;
  }
}

function betStatusColor(status: MatchBetListItem['betStatus']): string {
  switch (status) {
    case 'WON':
      return '#22c55e';
    case 'LOST':
      return '#ef4444';
    case 'RESULT':
      return '#eab308';
    case 'SET':
      return '#a1a1aa';
    default:
      return '#a1a1aa';
  }
}

function MatchBetRow({
  item,
  isCurrentUser,
}: {
  item: MatchBetListItem;
  isCurrentUser: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isCurrentUser ? '#EA580C' : '#3f3f46',
        backgroundColor: isCurrentUser ? '#2a1510' : '#13161a',
      }}
    >
      <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {item.displayName}
          </Text>
          {isCurrentUser ? (
            <Text style={{ color: '#EA580C', fontSize: 12, fontWeight: '600' }}>
              You
            </Text>
          ) : null}
        </View>
        <Text variant="bodySmall" style={{ color: '#e4e4e7', marginTop: 4 }}>
          {item.homeScore} — {item.awayScore}
        </Text>
        <Text
          style={{
            color: betStatusColor(item.betStatus),
            marginTop: 6,
            fontSize: 13,
            fontWeight: '600',
          }}
        >
          {betStatusLabel(item.betStatus)}
        </Text>
      </View>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const theme = useTheme();
  const { data: me } = useUserProfileQuery();
  const {
    data: matches,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMatchesQuery();

  const {
    data: matchBets,
    isPending: betsPending,
    isFetching: betsFetching,
    isError: betsError,
    error: betsQueryError,
    refetch: refetchBets,
  } = useMatchBetsQuery(matchId);

  const match = matches?.find((m) => m.id === matchId);

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

  return (
    <Screen>
      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#f1f5f9"
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="headlineSmall">{match.homeTeam}</Text>
            <Text style={{ width: 24, textAlign: 'center', opacity: 0.7 }}>
              v
            </Text>
            <Text variant="headlineSmall">{match.awayTeam}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Text
              variant="headlineSmall"
              style={{ flex: 1, textAlign: 'right' }}
            >
              {match.homeTeam}
            </Text>
            <Text style={{ width: 24, textAlign: 'center', opacity: 0.7 }}>
              v
            </Text>
            <Text
              variant="headlineSmall"
              style={{ flex: 1, textAlign: 'left' }}
            >
              {match.awayTeam}
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
              variant="displaySmall"
              style={{ flex: 1, textAlign: 'right' }}
            >
              {score(match.homeScore)}
            </Text>
            <Text style={{ width: 24, textAlign: 'center', opacity: 0.5 }}>
              —
            </Text>
            <Text variant="displaySmall" style={{ flex: 1, textAlign: 'left' }}>
              {score(match.awayScore)}
            </Text>
          </View>

          {match.betStatus !== 'UNSET' && (
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  variant="titleLarge"
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
                  variant="titleLarge"
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

          <View style={{ gap: 12 }}>
            {matchBets?.map((row) => (
              <MatchBetRow
                key={row.userId}
                item={row}
                isCurrentUser={row.userId === me?.id}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
