import { MatchData } from '@garage-bet/models';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, Text, useTheme } from 'react-native-paper';
import { useUpdateMatchScoreMutation } from '../mutations/update-match-score.mutation';
import MatchScoreSelect from './MatchScoreSelect';
import PressableCheckbox from './PressableCheckbox';

export default function UpdateMatchScoreDialog({
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
  const [isEnded, setIsEnded] = useState(false);

  const theme = useTheme();
  const { mutateAsync: updateScore } = useUpdateMatchScoreMutation();

  useEffect(() => {
    if (!match) return;
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setIsEnded(match.status === 'FINISHED');
  }, [match]);

  if (!match) {
    return null;
  }

  const onSubmit = () => {
    updateScore({
      matchId: match.id,
      homeScore,
      awayScore,
      isEnded,
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
      <Dialog.Title>Update score</Dialog.Title>
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
            alignItems: 'center',
            gap: 16,
            marginTop: 16,
          }}
        >
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <MatchScoreSelect value={homeScore} onSelect={setHomeScore} />
          </View>

          <Text style={{ width: 16, textAlign: 'center' }}>-</Text>

          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <MatchScoreSelect value={awayScore} onSelect={setAwayScore} />
          </View>
        </View>

        <PressableCheckbox
          checked={isEnded}
          onPress={() => setIsEnded((v) => !v)}
          label="Match ended"
        />
      </Dialog.Content>
      <Dialog.Actions
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Button
          onPress={() => onOpenChange(false)}
          mode="contained"
          compact
          style={{ backgroundColor: theme.colors.error }}
        >
          Cancel
        </Button>
        <Button mode="contained" compact onPress={onSubmit}>
          Update score
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
