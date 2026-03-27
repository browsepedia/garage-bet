import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { useMatchesQuery } from '../../../queries/matches.query';
import { formatInUserTimezone } from '../../../utils/format-date';

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const theme = useTheme();
  const {
    data: matches,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMatchesQuery();

  const match = matches?.find((m) => m.id === matchId);

  if (isLoading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EA580C" />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen style={{ justifyContent: 'center', gap: 16, padding: 16 }}>
        <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
          {error instanceof Error ? error.message : 'Could not load match.'}
        </Text>
        <Button mode="contained" onPress={() => refetch()}>
          Try again
        </Button>
        <Button mode="text" onPress={() => router.back()}>
          Go back
        </Button>
      </Screen>
    );
  }

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
      <View style={{ gap: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <Text variant="headlineSmall" style={{ flex: 1, textAlign: 'right' }}>
            {match.homeTeam}
          </Text>
          <Text style={{ width: 24, textAlign: 'center', opacity: 0.7 }}>
            v
          </Text>
          <Text variant="headlineSmall" style={{ flex: 1, textAlign: 'left' }}>
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
          <Text variant="displaySmall" style={{ flex: 1, textAlign: 'right' }}>
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
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Your prediction
            </Text>
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
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Status: {match.betStatus}
            </Text>
          </View>
        )}

        <View style={{ gap: 4 }}>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
            {formatInUserTimezone(match.kickoffAt, 'EEEE, dd MMM yyyy · HH:mm')}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
            {match.competition} · {match.season}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
            {match.stage}
            {match.groupName ? ` · Group ${match.groupName}` : ''}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
            Match status: {match.status}
          </Text>
        </View>

        <Button
          mode="outlined"
          onPress={() => refetch()}
          loading={isRefetching}
          disabled={isRefetching}
        >
          Refresh
        </Button>
      </View>
    </Screen>
  );
}
