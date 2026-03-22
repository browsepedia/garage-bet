import { MatchData } from '@garage-bet/models';
import { memo } from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatInUserTimezone } from '../utils/format-date';
import { Button } from './Button';

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

  const theme = useTheme();

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#3f3f46',
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
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Text variant="titleMedium" style={{ flex: 1, textAlign: 'right' }}>
          {match.homeTeam}
        </Text>
        <Text style={{ width: 16, textAlign: 'center' }}>-</Text>
        <Text variant="titleMedium" style={{ flex: 1, textAlign: 'left' }}>
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
        <Text variant="titleMedium" style={{ flex: 1, textAlign: 'right' }}>
          {match.homeScore}
        </Text>
        <Text style={{ width: 16, textAlign: 'center' }}>-</Text>
        <Text variant="titleMedium" style={{ flex: 1, textAlign: 'left' }}>
          {match.awayScore}
        </Text>
      </View>

      {match.betStatus !== 'UNSET' && (
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
            {match.homeScore}
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
            {match.awayScore}
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

        {match.betStatus === 'UNSET' && match.status !== 'FINISHED' && (
          <View style={{ flexShrink: 0 }}>
            <Button mode="contained" compact onPress={() => onSetBetClick(match)}>
              Place bet
            </Button>
          </View>
        )}

        {match.betStatus === 'SET' && (
          <View style={{ flexShrink: 0 }}>
            <Button mode="contained" compact onPress={() => onSetBetClick(match)}>
              Update bet
            </Button>
          </View>
        )}

        {match.betStatus === 'UNSET' && match.status === 'FINISHED' && (
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            Unset
          </Text>
        )}

        {match.betStatus === 'WON' && (
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            Won
          </Text>
        )}

        {match.betStatus === 'LOST' && (
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            Lost
          </Text>
        )}

        {match.betStatus === 'RESULT' && (
          <Text variant="bodySmall" style={{ color: '#a1a1aa' }}>
            Result
          </Text>
        )}
      </View>
    </Card>
  );
}

export default memo(MatchCard);
