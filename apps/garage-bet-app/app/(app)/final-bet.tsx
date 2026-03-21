import type { FinalBetTeamOption } from '@garage-bet/models';
import { UpsertFinalBetPayloadSchema } from '@garage-bet/models';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Menu, Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { useUpsertFinalBetMutation } from '../../mutations/final-bet.mutation';
import { useFinalBetQuery } from '../../queries/final-bet.query';
import { useSeasonsQuery } from '../../queries/seasons.query';

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
  const [open, setOpen] = useState(false);
  const selected = options.find((t) => t.id === valueId);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text variant="labelLarge" style={{ marginBottom: 6 }}>
        {label}
      </Text>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          <Pressable
            disabled={disabled}
            onPress={() => !disabled && setOpen(true)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#3f3f46',
              borderRadius: 4,
              backgroundColor: disabled ? '#1a1d22' : '#13161a',
            }}
          >
            <Text>{selected?.name ?? 'Select team'}</Text>
          </Pressable>
        }
        contentStyle={{
          backgroundColor: '#13161a',
          borderWidth: 1,
          borderColor: '#3f3f46',
        }}
      >
        {options.map((t) => (
          <Menu.Item
            key={t.id}
            onPress={() => {
              onSelect(t.id);
              setOpen(false);
            }}
            title={t.name}
          />
        ))}
      </Menu>
    </View>
  );
}

export default function FinalBetScreen() {
  const { data: seasons, isLoading: seasonsLoading } = useSeasonsQuery();
  const [seasonId, setSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (seasons?.length && !seasonId) {
      setSeasonId(seasons[0].id);
    }
  }, [seasons, seasonId]);

  const { data: ctx, isLoading: ctxLoading } = useFinalBetQuery(seasonId);
  const { mutateAsync: save, isPending: saving } =
    useUpsertFinalBetMutation(seasonId);

  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    if (ctx.myBet) {
      setHomeId(ctx.myBet.predictedHomeTeamId);
      setAwayId(ctx.myBet.predictedAwayTeamId);
      setHomeScore(String(ctx.myBet.predictedHomeScore));
      setAwayScore(String(ctx.myBet.predictedAwayScore));
    } else if (ctx.teamOptions.length >= 2) {
      setHomeId(ctx.teamOptions[0].id);
      setAwayId(ctx.teamOptions[1].id);
      setHomeScore('0');
      setAwayScore('0');
    }
  }, [ctx?.seasonId, ctx?.myBet?.updatedAt]);

  const canEdit = ctx?.finalBettingOpen ?? false;
  const teamOptions = ctx?.teamOptions ?? [];

  const onSave = async () => {
    setError(null);
    const hs = Number.parseInt(homeScore, 10);
    const as = Number.parseInt(awayScore, 10);
    const parsed = UpsertFinalBetPayloadSchema.safeParse({
      predictedHomeTeamId: homeId,
      predictedAwayTeamId: awayId,
      predictedHomeScore: hs,
      predictedAwayScore: as,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    try {
      await save(parsed.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const seasonLabel = useMemo(() => {
    if (!seasons?.length) return '';
    const s = seasons.find((x) => x.id === seasonId);
    if (!s) return '';
    return `${s.competition.name} — ${s.name}${s.year ? ` (${s.year})` : ''}`;
  }, [seasons, seasonId]);

  if (seasonsLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (!seasons?.length) {
    return (
      <Screen>
        <Text style={{ padding: 16 }}>No seasons available yet.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
          Final bet
        </Text>
        <Text variant="bodySmall" style={{ color: '#a1a1aa', marginBottom: 16 }}>
          Pick the two finalists (home vs away) and the score. One entry per
          championship (season). Points: 2 / 5 / 7 / 10 when the result is
          known.
        </Text>

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>
          Championship
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {seasons.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSeasonId(s.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: seasonId === s.id ? '#EA580C' : '#3f3f46',
                  backgroundColor: seasonId === s.id ? '#2a1510' : '#13161a',
                }}
              >
                <Text numberOfLines={2} style={{ maxWidth: 200 }}>
                  {s.competition.name}
                  {'\n'}
                  <Text style={{ color: '#a1a1aa' }}>{s.name}</Text>
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {ctxLoading || !ctx ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <>
            <Text style={{ color: '#a1a1aa', marginBottom: 16 }}>
              {seasonLabel}
              {!ctx.finalBettingOpen ? ' · Betting closed' : ''}
            </Text>

            {ctx.actual ? (
              <View
                style={{
                  padding: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#3f3f46',
                  borderRadius: 8,
                  backgroundColor: '#13161a',
                }}
              >
                <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                  Actual final
                </Text>
                <Text>
                  {ctx.actual.homeTeamName} {ctx.actual.homeScore ?? '—'} —{' '}
                  {ctx.actual.awayScore ?? '—'} {ctx.actual.awayTeamName}
                </Text>
                {ctx.awardedPoints !== null ? (
                  <Text style={{ marginTop: 8, color: '#EA580C' }}>
                    Your points: {ctx.awardedPoints}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <TeamMenu
              label="Home (final)"
              options={teamOptions}
              valueId={homeId}
              onSelect={setHomeId}
              disabled={!canEdit}
            />
            <TeamMenu
              label="Away (final)"
              options={teamOptions}
              valueId={awayId}
              onSelect={setAwayId}
              disabled={!canEdit}
            />

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>
                  Home goals
                </Text>
                <TextInput
                  editable={canEdit}
                  keyboardType="number-pad"
                  value={homeScore}
                  onChangeText={setHomeScore}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#3f3f46',
                    borderRadius: 4,
                    color: '#f1f5f9',
                    backgroundColor: '#13161a',
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>
                  Away goals
                </Text>
                <TextInput
                  editable={canEdit}
                  keyboardType="number-pad"
                  value={awayScore}
                  onChangeText={setAwayScore}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#3f3f46',
                    borderRadius: 4,
                    color: '#f1f5f9',
                    backgroundColor: '#13161a',
                  }}
                />
              </View>
            </View>

            {error ? (
              <Text style={{ color: '#fca5a5', marginBottom: 12 }}>{error}</Text>
            ) : null}

            {canEdit ? (
              <Pressable
                onPress={onSave}
                disabled={saving}
                style={{
                  padding: 14,
                  backgroundColor: '#EA580C',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    Save final bet
                  </Text>
                )}
              </Pressable>
            ) : (
              <Text style={{ color: '#a1a1aa' }}>
                You cannot change this pick while betting is closed.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
