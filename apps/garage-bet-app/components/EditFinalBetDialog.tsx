import {
  type FinalBetTeamOption,
  UpsertFinalBetPayloadSchema,
} from '@garage-bet/models';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button, Dialog, Text, useTheme } from 'react-native-paper';
import { useUpsertFinalBetMutation } from '../mutations/final-bet.mutation';
import { useFinalBetQuery } from '../queries/final-bet.query';
import { AppTheme } from '../theme';
import { LabeledSelectMenu } from './LabeledSelectMenu';
import MatchScoreSelect from './MatchScoreSelect';

function TeamMenu({
  label,
  options,
  valueId,
  onSelect,
  disabled,
}: {
  label: string;
  options: FinalBetTeamOption[];
  valueId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <LabeledSelectMenu
      label={label}
      options={options}
      value={valueId}
      onSelect={onSelect}
      getOptionLabel={(t) => t.name}
      placeholder="Select team"
      disabled={disabled}
    />
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string | null;
};

export function EditFinalBetDialog({ open, onOpenChange, seasonId }: Props) {
  const theme = useTheme<AppTheme>();
  const { height: windowHeight } = useWindowDimensions();
  const dialogMaxHeight = Math.round(windowHeight * 0.9);

  const { data: finalBet, isLoading } = useFinalBetQuery(
    open ? seasonId : null,
  );
  const { mutateAsync: save, isPending: saving } =
    useUpsertFinalBetMutation(seasonId);

  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!finalBet) {
      return;
    }

    if (finalBet.myBet) {
      setHomeId(finalBet.myBet.predictedHomeTeamId);
      setAwayId(finalBet.myBet.predictedAwayTeamId);
      setHomeScore(finalBet.myBet.predictedHomeScore);
      setAwayScore(finalBet.myBet.predictedAwayScore);
    } else if (finalBet.teamOptions.length >= 2) {
      setHomeId(finalBet.teamOptions[0].id);
      setAwayId(finalBet.teamOptions[1].id);
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [finalBet]);

  const canEdit = finalBet?.finalBettingOpen ?? false;
  const teamOptions = finalBet?.teamOptions ?? [];

  const onSave = async () => {
    setError(null);
    const parsed = UpsertFinalBetPayloadSchema.safeParse({
      predictedHomeTeamId: homeId,
      predictedAwayTeamId: awayId,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    try {
      await save(parsed.data);
      onOpenChange(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (!seasonId) {
    return null;
  }

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
        maxHeight: dialogMaxHeight,
        overflow: 'hidden',
        alignSelf: 'center',
        width: '92%',
        maxWidth: 480,
        justifyContent: 'flex-start',
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          maxHeight: dialogMaxHeight,
          flexShrink: 1,
        }}
      >
        <Dialog.Title>Your final bet</Dialog.Title>
        <Dialog.Content
          style={{
            paddingHorizontal: 0,
            paddingBottom: theme.spacing(1),
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 1 }}
            contentContainerStyle={{
              paddingHorizontal: theme.spacing(3),
              paddingBottom: theme.spacing(1),
            }}
          >
            {isLoading || !finalBet ? (
              <ActivityIndicator style={{ marginVertical: theme.spacing(3) }} />
            ) : (
              <>
                <Text
                  style={{ color: '#a1a1aa', marginBottom: theme.spacing(2) }}
                >
                  {!finalBet.finalBettingOpen ? 'Betting closed · ' : ''}
                  {finalBet.competitionName} — {finalBet.seasonName}
                </Text>

                {finalBet.actual ? (
                  <View
                    style={{
                      padding: theme.spacing(1),
                      marginBottom: theme.spacing(2),
                      borderWidth: 1,
                      borderColor: '#3f3f46',
                      borderRadius: 8,
                      backgroundColor: '#13161a',
                    }}
                  >
                    <Text
                      variant="titleSmall"
                      style={{ marginBottom: theme.spacing(1) }}
                    >
                      Actual final
                    </Text>
                    <Text>
                      {finalBet.actual.homeTeamName}{' '}
                      {finalBet.actual.homeScore ?? '—'} —{' '}
                      {finalBet.actual.awayScore ?? '—'}{' '}
                      {finalBet.actual.awayTeamName}
                    </Text>
                    {finalBet.awardedPoints !== null ? (
                      <Text
                        style={{
                          marginTop: theme.spacing(1),
                          color: '#EA580C',
                        }}
                      >
                        Your points: {finalBet.awardedPoints}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <View style={{ gap: theme.spacing(2) }}>
                  <View style={{ flexDirection: 'row', gap: theme.spacing(2) }}>
                    <View style={{ flex: 1 }}>
                      <TeamMenu
                        label="Home team"
                        options={teamOptions}
                        valueId={homeId}
                        onSelect={setHomeId}
                        disabled={!canEdit}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <TeamMenu
                        label="Away team"
                        options={teamOptions}
                        valueId={awayId}
                        onSelect={setAwayId}
                        disabled={!canEdit}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      gap: theme.spacing(2),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MatchScoreSelect
                      value={homeScore}
                      onSelect={setHomeScore}
                    />
                    <MatchScoreSelect
                      value={Number(awayScore)}
                      onSelect={setAwayScore}
                    />
                  </View>
                </View>

                {error ? (
                  <Text
                    style={{ color: '#fca5a5', marginBottom: theme.spacing(1) }}
                  >
                    {error}
                  </Text>
                ) : null}

                {!canEdit ? (
                  <Text
                    style={{ color: '#a1a1aa', marginBottom: theme.spacing(1) }}
                  >
                    You cannot change this pick while betting is closed.
                  </Text>
                ) : null}
              </>
            )}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing(1),
            paddingBottom: theme.spacing(1),
          }}
        >
          <Button onPress={() => onOpenChange(false)} mode="text">
            Cancel
          </Button>
          {canEdit && finalBet ? (
            <Button
              mode="contained"
              compact
              onPress={() => void onSave()}
              disabled={saving || isLoading}
              loading={saving}
            >
              Save final bet
            </Button>
          ) : null}
        </Dialog.Actions>
      </View>
    </Dialog>
  );
}
