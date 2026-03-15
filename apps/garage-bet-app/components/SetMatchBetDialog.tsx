import { MatchData } from '@garage-bet/models';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, Text, useTheme } from 'react-native-paper';
import { useSetBetMutation } from '../mutations/set-bet.mutation';
import { NumberSelectExpo } from './NumberSelectExpo';

export default function SetMatchBetDialog({
  open,
  match,
  onOpenChange,
}: {
  open: boolean;
  match: MatchData | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const theme = useTheme();
  const { mutateAsync: setBet } = useSetBetMutation();

  useEffect(() => {
    if (!match) return;
    setHomeScore(match.homeBetScore ?? 0);
    setAwayScore(match.awayBetScore ?? 0);
  }, [match]);

  if (!match) {
    return null;
  }

  const onSetBet = () => {
    setBet({
      matchId: match.id,
      homeScore,
      awayScore,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      visible={open}
      onDismiss={() => onOpenChange(false)}
      style={{
        borderWidth: 1,
        borderColor: '#3f3f46',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Dialog.Title>Set bet</Dialog.Title>
      <Dialog.Content>
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
            marginTop: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <NumberSelectExpo
              value={homeScore}
              onChange={setHomeScore}
              label="Home team score"
              textAlign="right"
            />
          </View>
          <Text style={{ width: 16, textAlign: 'center' }}>-</Text>
          <View style={{ flex: 1 }}>
            <NumberSelectExpo
              value={awayScore}
              onChange={setAwayScore}
              label="Away team score"
              textAlign="left"
            />
          </View>
        </View>
      </Dialog.Content>
      <Dialog.Actions
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Button
          onPress={() => onOpenChange(false)}
          mode="contained"
          style={{ backgroundColor: theme.colors.error }}
        >
          Cancel
        </Button>
        <Button mode="contained" onPress={onSetBet}>
          Set bet
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
