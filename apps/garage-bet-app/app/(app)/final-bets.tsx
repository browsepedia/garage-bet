import type {
  FinalBetListItem,
  MatchData,
  SeasonListItem,
} from '@garage-bet/models';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { EditFinalBetDialog } from '../../components/EditFinalBetDialog';
import { LabeledSelectMenu } from '../../components/LabeledSelectMenu';
import { Screen } from '../../components/Screen';
import { useFinalBetsListQuery } from '../../queries/final-bets-list.query';
import { useMatchesQuery } from '../../queries/matches.query';
import { useSeasonsQuery } from '../../queries/seasons.query';
import { useUserProfileQuery } from '../../queries/user-profile.query';

type ChampionshipSeasonOption = {
  id: string;
  season: SeasonListItem;
};

function championshipSeasonLabel(opt: ChampionshipSeasonOption) {
  const s = opt.season;
  const seasonPart = s.year != null ? `${s.name}` : s.name;
  return `${s.competition.name} - ${seasonPart}`;
}

/** True if this season has at least one fixture whose kickoff is on or before now. Invalid dates are ignored (treated as not started). */
function seasonHasAnyMatchKickoffInPast(
  seasonId: string,
  matches: MatchData[],
): boolean {
  const now = Date.now();
  return matches.some((m) => {
    if (m.seasonId !== seasonId) return false;
    const kickoffMs = Date.parse(m.kickoffAt);
    if (Number.isNaN(kickoffMs)) return false;
    return kickoffMs <= now;
  });
}

function FinalBetRow({
  item,
  isCurrentUser,
  onEditPick,
}: {
  item: FinalBetListItem;
  isCurrentUser: boolean;
  onEditPick?: () => void;
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
      <View style={{ justifyContent: 'center' }}>
        <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
      </View>
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
      {isCurrentUser && onEditPick ? (
        <View style={{ justifyContent: 'center' }}>
          <Button mode="text" compact onPress={onEditPick}>
            Edit pick
          </Button>
        </View>
      ) : null}
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

  const [seasonId, setSeasonId] = useState<string | null>(null);

  const championshipSeasonOptions = useMemo((): ChampionshipSeasonOption[] => {
    const list = [...(seasons ?? [])];
    list.sort((a, b) => {
      const byComp = a.competition.name.localeCompare(
        b.competition.name,
        undefined,
        {
          sensitivity: 'base',
        },
      );
      if (byComp !== 0) return byComp;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return list.map((s) => ({ id: s.id, season: s }));
  }, [seasons]);

  useEffect(() => {
    if (!championshipSeasonOptions.length) {
      setSeasonId(null);
      return;
    }
    if (
      !seasonId ||
      !championshipSeasonOptions.some((o) => o.id === seasonId)
    ) {
      setSeasonId(championshipSeasonOptions[0].id);
    }
  }, [championshipSeasonOptions, seasonId]);

  const { data: list, isLoading: listLoading } =
    useFinalBetsListQuery(seasonId);

  const { data: matchesList, isSuccess: matchesQuerySuccess } =
    useMatchesQuery();

  const seasonHasStartedMatch = useMemo(() => {
    if (!seasonId || !matchesList) {
      return false;
    }

    return seasonHasAnyMatchKickoffInPast(seasonId, matchesList);
  }, [seasonId, matchesList]);

  /** Require successful /matches load and no past kickoff in this season before showing edit entry points. */
  const canEditFinalPickBySchedule =
    matchesQuerySuccess && !seasonHasStartedMatch;

  const [finalBetDialogOpen, setFinalBetDialogOpen] = useState(false);

  const openFinalBetDialog = useCallback(() => setFinalBetDialogOpen(true), []);

  useEffect(() => {
    setFinalBetDialogOpen(false);
  }, [seasonId]);

  useEffect(() => {
    if (!canEditFinalPickBySchedule) {
      setFinalBetDialogOpen(false);
    }
  }, [canEditFinalPickBySchedule]);

  const currentUserInList = Boolean(
    me?.id && list?.some((row) => row.userId === me.id),
  );

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
            label="Championship & season"
            options={championshipSeasonOptions}
            value={seasonId}
            onSelect={setSeasonId}
            getOptionLabel={championshipSeasonLabel}
            placeholder="Select championship and season"
            emptyMessage="No seasons available"
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
            Everyone’s final picks for the season you selected. Edit yours from
            your row or “Set your final bet” (one per season). Points: 2 / 5 / 7
            / 10 when the result is known.
          </Text>

          <Text variant="titleSmall" style={{ marginBottom: 8 }}>
            All picks
            {list && list.length > 0 ? ` (${list.length})` : ''}
          </Text>

          {!seasonId ? (
            <Text style={{ color: '#a1a1aa', marginBottom: 16 }}>
              Select a championship / season above to see picks.
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
                  onEditPick={
                    item.userId === me?.id && canEditFinalPickBySchedule
                      ? openFinalBetDialog
                      : undefined
                  }
                />
              ))}
            </View>
          )}

          {seasonId &&
          me &&
          !currentUserInList &&
          !listLoading &&
          canEditFinalPickBySchedule ? (
            <View style={{ marginBottom: 24 }}>
              <Button mode="contained" onPress={openFinalBetDialog}>
                Set your final bet
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <EditFinalBetDialog
        open={finalBetDialogOpen}
        onOpenChange={setFinalBetDialogOpen}
        seasonId={seasonId}
      />
    </Screen>
  );
}
