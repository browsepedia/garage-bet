import type {
  FinalBetListItem,
  FinalBetTeamOption,
  SeasonListItem,
} from '@garage-bet/models';
import { UpsertFinalBetPayloadSchema } from '@garage-bet/models';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Avatar, Menu, Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useUpsertFinalBetMutation } from '../../mutations/final-bet.mutation';
import { useFinalBetQuery } from '../../queries/final-bet.query';
import { useFinalBetsListQuery } from '../../queries/final-bets-list.query';
import { useSeasonsQuery } from '../../queries/seasons.query';
import { useUserProfileQuery } from '../../queries/user-profile.query';

type CompetitionOption = { id: string; name: string };

function LabeledSelectMenu<T extends { id: string }>({
  label,
  options,
  valueId,
  onSelect,
  getOptionLabel,
  placeholder,
  emptyMessage,
}: {
  label: string;
  options: T[];
  valueId: string | null;
  onSelect: (id: string) => void;
  getOptionLabel: (item: T) => string;
  placeholder: string;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === valueId);

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
            disabled={options.length === 0}
            onPress={() => options.length > 0 && setOpen(true)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#3f3f46',
              borderRadius: 4,
              backgroundColor: options.length === 0 ? '#1a1d22' : '#13161a',
            }}
          >
            <Text>
              {selected
                ? getOptionLabel(selected)
                : (emptyMessage ?? placeholder)}
            </Text>
          </Pressable>
        }
        contentStyle={{
          backgroundColor: '#13161a',
          borderWidth: 1,
          borderColor: '#3f3f46',
        }}
      >
        {options.map((item) => (
          <Menu.Item
            key={item.id}
            onPress={() => {
              onSelect(item.id);
              setOpen(false);
            }}
            title={getOptionLabel(item)}
          />
        ))}
      </Menu>
    </View>
  );
}

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

function seasonMenuLabel(s: SeasonListItem) {
  return `${s.name}${s.year != null ? ` (${s.year})` : ''}`;
}

function FinalBetRow({
  item,
  isCurrentUser,
}: {
  item: FinalBetListItem;
  isCurrentUser: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
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
          {item.predictedHomeTeamName} {item.predictedHomeScore} —{' '}
          {item.predictedAwayScore} {item.predictedAwayTeamName}
        </Text>
        {item.awardedPoints !== null ? (
          <Text style={{ color: '#EA580C', marginTop: 6, fontSize: 13 }}>
            Points: {item.awardedPoints}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function FinalBetsScreen() {
  const theme = useTheme();
  const { data: me } = useUserProfileQuery();
  const {
    data: seasons,
    isPending: seasonsPending,
    isError: seasonsError,
    error: seasonsQueryError,
    refetch: refetchSeasons,
  } = useSeasonsQuery();

  useFocusEffect(
    useCallback(() => {
      void refetchSeasons();
    }, [refetchSeasons]),
  );

  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  const competitions = useMemo((): CompetitionOption[] => {
    const map = new Map<string, CompetitionOption>();
    for (const s of seasons ?? []) {
      map.set(s.competition.id, {
        id: s.competition.id,
        name: s.competition.name,
      });
    }
    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
  }, [seasons]);

  const seasonsForCompetition = useMemo(() => {
    return (seasons ?? [])
      .filter((s) => s.competition.id === competitionId)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
  }, [seasons, competitionId]);

  useEffect(() => {
    if (!competitions.length) return;
    if (!competitionId || !competitions.some((c) => c.id === competitionId)) {
      setCompetitionId(competitions[0].id);
    }
  }, [competitions, competitionId]);

  useEffect(() => {
    if (!seasonsForCompetition.length) {
      setSeasonId(null);
      return;
    }
    if (!seasonId || !seasonsForCompetition.some((s) => s.id === seasonId)) {
      setSeasonId(seasonsForCompetition[0].id);
    }
  }, [seasonsForCompetition, seasonId]);

  const { data: list, isLoading: listLoading } =
    useFinalBetsListQuery(seasonId);
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
  }, [ctx]);

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

  if (seasonsPending) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (seasonsError) {
    const message =
      seasonsQueryError instanceof Error
        ? seasonsQueryError.message
        : 'Could not load seasons.';
    return (
      <Screen>
        <View style={{ padding: 16, gap: 12 }}>
          <Text variant="titleMedium">Couldn’t load seasons</Text>
          <Text style={{ color: '#fca5a5' }}>{message}</Text>
          <Button mode="contained" onPress={() => void refetchSeasons()}>
            Try again
          </Button>
        </View>
      </Screen>
    );
  }

  if (!seasons?.length) {
    return (
      <Screen>
        <View style={{ padding: 16, gap: 12 }}>
          <Text>No seasons available yet.</Text>
          <Button mode="outlined" onPress={() => void refetchSeasons()}>
            Refresh
          </Button>
        </View>
      </Screen>
    );
  }

  const stickyBg = theme.colors.background;

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 12,
            backgroundColor: stickyBg,
            borderBottomWidth: 1,
            borderBottomColor: '#27272a',
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
            Final bets
          </Text>
          <LabeledSelectMenu
            label="Championship"
            options={competitions}
            valueId={competitionId}
            onSelect={setCompetitionId}
            getOptionLabel={(c) => c.name}
            placeholder="Select championship"
          />
          <LabeledSelectMenu
            label="Season"
            options={seasonsForCompetition}
            valueId={seasonId}
            onSelect={setSeasonId}
            getOptionLabel={seasonMenuLabel}
            placeholder="Select season"
            emptyMessage="No season for this championship"
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >
          <Text
            variant="bodySmall"
            style={{ color: '#a1a1aa', marginBottom: 16 }}
          >
            Everyone’s final picks for the season you selected. Make or update
            your own pick below (one per season). Points: 2 / 5 / 7 / 10 when
            the result is known.
          </Text>

          <Text variant="titleSmall" style={{ marginBottom: 8 }}>
            All picks
            {list && list.length > 0 ? ` (${list.length})` : ''}
          </Text>

          {!seasonId ? (
            <Text style={{ color: '#a1a1aa', marginBottom: 16 }}>
              Select a championship and season to see picks.
            </Text>
          ) : listLoading ? (
            <ActivityIndicator style={{ marginBottom: 24 }} />
          ) : !list?.length ? (
            <Text style={{ color: '#a1a1aa', marginBottom: 24 }}>
              No final bets yet for this season.
            </Text>
          ) : (
            <View style={{ marginBottom: 24 }}>
              {list.map((item) => (
                <FinalBetRow
                  key={item.userId}
                  item={item}
                  isCurrentUser={item.userId === me?.id}
                />
              ))}
            </View>
          )}

          <View
            style={{
              height: 1,
              backgroundColor: '#3f3f46',
              marginVertical: 8,
            }}
          />

          {ctxLoading || !ctx ? (
            seasonId ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : null
          ) : (
            <>
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                Your pick
              </Text>
              <Text style={{ color: '#a1a1aa', marginBottom: 16 }}>
                {!ctx.finalBettingOpen ? 'Betting closed · ' : ''}
                {ctx.competitionName} — {ctx.seasonName}
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
                <Text style={{ color: '#fca5a5', marginBottom: 12 }}>
                  {error}
                </Text>
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
      </View>
    </Screen>
  );
}
