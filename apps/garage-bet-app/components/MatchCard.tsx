import { MatchBetListItem, MatchData } from '@garage-bet/models';
import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';
import { formatInUserTimezone } from '../utils/format-date';
import { hasMatchStarted } from '../utils/match-utils';
import { useBetStatusColor } from '../utils/use-bet-status-color';
import { Button } from './Button';
import { TeamLogo } from './TeamLogo';

function MatchCard({
  match,
  showStanding = true,
  showChampionship = true,
  onSetBetClick,
  onUpdateScoreClick,
  showOnlyStartTime = false,
  isAdminUser = false,
}: {
  showStanding?: boolean;
  showChampionship?: boolean;
  match: MatchData;
  onSetBetClick: (match: MatchData) => void;
  onUpdateScoreClick?: (match: MatchData) => void;
  showOnlyStartTime?: boolean;
  isAdminUser?: boolean;
}) {
  const statusColor = useBetStatusColor(
    match.betStatus as MatchBetListItem['betStatus'],
  );

  const theme = useTheme<AppTheme>();
  const started = hasMatchStarted(match);

  const borderColor = useMemo(() => {
    if (match.betStatus === 'UNSET') {
      return theme.colors.outline;
    }

    if (match.betStatus === 'SET') {
      return theme.colors.outline;
    }

    return statusColor;
  }, [match.betStatus, theme, statusColor]);

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: theme.spacing(1),
        padding: theme.spacing(2),
        borderWidth: 1,
        borderColor,
        backgroundColor: '#13161a',
        borderRadius: theme.roundness,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: theme.spacing(1),
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            gap: theme.spacing(1),
            flexDirection: 'row',
          }}
        >
          <Text variant="titleSmall" style={{ flex: 1, textAlign: 'right' }}>
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
            gap: theme.spacing(1),
            flexDirection: 'row',
          }}
        >
          {match.awayTeamLogoUrl ? (
            <TeamLogo uri={match.awayTeamLogoUrl} />
          ) : null}
          <Text
            variant="titleSmall"
            style={{ flex: 1, textAlign: 'left', lineHeight: 15 }}
          >
            {match.awayTeam}
          </Text>
        </View>
      </View>

      {(match.status === 'FINISHED' || match.status === 'LIVE') && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: theme.spacing(1),
            alignItems: 'center',
          }}
        >
          <Text variant="titleSmall" style={{ flex: 1, textAlign: 'right' }}>
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
            gap: theme.spacing(1),
            alignItems: 'center',
          }}
        >
          <Text
            variant="titleSmall"
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
            variant="titleSmall"
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
          gap: theme.spacing(2),
          alignItems: 'flex-end',
          marginTop: match.status === 'FINISHED' ? -24 : 0,
        }}
      >
        <View style={{ minWidth: 0 }}>
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            {showOnlyStartTime
              ? formatInUserTimezone(match.kickoffAt, 'HH:mm')
              : formatInUserTimezone(match.kickoffAt, 'dd MMM yyyy HH:mm')}
          </Text>
          {showChampionship && (
            <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
              {match.competition}
            </Text>
          )}
          {showStanding && (
            <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
              {match.stage} {match.groupName}
            </Text>
          )}
          {match.venue ? (
            <Text
              variant="bodySmall"
              style={{ color: '#a1a1aa' }}
              numberOfLines={2}
            >
              {match.venue}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            flexShrink: 0,
            gap: theme.spacing(1),
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

          {isAdminUser && (
            <Button
              mode="contained"
              compact
              onPress={() => onUpdateScoreClick?.(match)}
            >
              Update score
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
