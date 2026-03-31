import { MatchData } from '@garage-bet/models';
import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';
import { formatInUserTimezone } from '../utils/format-date';
import { Button } from './Button';
import { TeamLogo } from './TeamLogo';

function hasMatchStarted(match: MatchData): boolean {
  if (match.status === 'LIVE' || match.status === 'FINISHED') {
    return true;
  }
  const kickoffMs = Date.parse(match.kickoffAt);
  if (Number.isNaN(kickoffMs)) {
    return false;
  }
  return kickoffMs <= Date.now();
}

function MatchCard({
  match,
  onSetBetClick,
}: {
  match: MatchData;
  onSetBetClick: (match: MatchData) => void;
}) {
  const statusColor =
    match.betStatus === 'WON'
      ? '#22c55e'
      : match.betStatus === 'LOST'
        ? '#ef4444'
        : '#eab308';

  const theme = useTheme<AppTheme>();
  const started = hasMatchStarted(match);

  const borderColor = useMemo(() => {
    if (match.betStatus === 'UNSET') {
      return '#3f3f46';
    }
    if (match.betStatus === 'SET') {
      return '#3f3f46';
    }

    if (match.betStatus === 'WON') {
      return '#22c55e';
    }

    if (match.betStatus === 'LOST') {
      return theme.colors.error;
    }

    if (match.betStatus === 'RESULT') {
      return theme.colors.warning;
    }

    return '#3f3f46';
  }, [match.betStatus, theme]);

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor,
        backgroundColor: '#13161a',
      }}
    >
      {match.betStatus !== 'UNSET' && (
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            backgroundColor: statusColor,
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 8,
            flexDirection: 'row',
          }}
        >
          <Text variant="titleMedium" style={{ flex: 1, textAlign: 'right' }}>
            {match.homeTeam}
          </Text>

          {match.homeTeamLogoUrl ? (
            <TeamLogo uri={match.homeTeamLogoUrl} />
          ) : null}
        </View>
        <Text style={{ width: 16, textAlign: 'center' }}>-</Text>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 8,
            flexDirection: 'row',
          }}
        >
          {match.awayTeamLogoUrl ? (
            <TeamLogo uri={match.awayTeamLogoUrl} />
          ) : null}
          <Text variant="titleMedium" style={{ flex: 1, textAlign: 'left' }}>
            {match.awayTeam}
          </Text>
        </View>
      </View>

      {(match.status === 'FINISHED' || match.status === 'LIVE') && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Text variant="titleMedium" style={{ flex: 1, textAlign: 'right' }}>
            {match.homeScore}
          </Text>
          <Text style={{ width: 16, textAlign: 'center' }}>-</Text>
          <Text variant="titleMedium" style={{ flex: 1, textAlign: 'left' }}>
            {match.awayScore}
          </Text>
        </View>
      )}

      {match.betStatus !== 'UNSET' && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
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
            {match.homeBetScore}
          </Text>
          <Text
            style={{
              width: 16,
              textAlign: 'center',
              color: theme.colors.onSurfaceDisabled,
            }}
          >
            -
          </Text>
          <Text
            variant="titleMedium"
            style={{
              flex: 1,
              textAlign: 'left',
              color: theme.colors.onSurfaceDisabled,
            }}
          >
            {match.awayBetScore}
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-end',
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            {formatInUserTimezone(match.kickoffAt, 'dd MMM yyyy HH:mm')}
          </Text>
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            {match.competition}
          </Text>
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            {match.stage}
          </Text>
        </View>

        <View
          style={{
            flexShrink: 0,
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          {match.betStatus === 'UNSET' && !started && (
            <Button
              mode="contained"
              compact
              onPress={() => onSetBetClick(match)}
            >
              Place bet
            </Button>
          )}

          {match.betStatus === 'SET' && !started && (
            <Button
              mode="contained"
              compact
              onPress={() => onSetBetClick(match)}
            >
              Update bet
            </Button>
          )}

          {started && (
            <Button
              mode="outlined"
              compact
              onPress={() => router.push(`/matches/${match.id}`)}
            >
              See bets
            </Button>
          )}
        </View>
      </View>
    </Card>
  );
}

export default memo(MatchCard);
