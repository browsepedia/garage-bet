import type { MatchData, SeasonListItem } from '@garage-bet/models';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { LabeledSelectMenu } from '../../../components/LabeledSelectMenu';
import { MatchesSectionList } from '../../../components/MatchesSectionList';
import PressableCheckbox from '../../../components/PressableCheckbox';
import { Screen } from '../../../components/Screen';
import SetMatchBetDialog from '../../../components/SetMatchBetDialog';
import UpdateMatchScoreDialog from '../../../components/UpdateMatchScoreDialog';
import { useMatchesBySeasonQuery } from '../../../queries/matches-by-season.query';
import { useSeasonsQuery } from '../../../queries/seasons.query';
import { useUserProfileQuery } from '../../../queries/user-profile.query';

type ChampionshipSeasonOption = {
  id: string;
  season: SeasonListItem;
};

function championshipSeasonLabel(opt: ChampionshipSeasonOption) {
  const s = opt.season;
  const seasonPart = s.year != null ? `${s.name}` : s.name;
  return `${s.competition.name} - ${seasonPart}`;
}

export default function Matches() {
  const { data: me } = useUserProfileQuery();
  const {
    data: seasons,
    isPending: seasonsPending,
    refetch: refetchSeasons,
  } = useSeasonsQuery();

  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [hideEndedMatches, setHideEndedMatches] = useState(true);
  const [groupByDate, setGroupByDate] = useState(true);

  const championshipSeasonOptions = useMemo((): ChampionshipSeasonOption[] => {
    const list = [...(seasons ?? [])];
    list.sort((a, b) => {
      const byComp = a.competition.name.localeCompare(
        b.competition.name,
        undefined,
        { sensitivity: 'base' },
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

  const {
    data: seasonMatches,
    isRefetching,
    refetch: refetchSeasonMatches,
    isPending: matchesPending,
  } = useMatchesBySeasonQuery(seasonId);

  useFocusEffect(
    useCallback(() => {
      void refetchSeasons();
      void refetchSeasonMatches();
    }, [refetchSeasons, refetchSeasonMatches]),
  );

  const matches = useMemo(() => {
    if (!seasonMatches) return [];
    let list = seasonMatches;
    if (hideEndedMatches) {
      list = list.filter((m) => m.status !== 'FINISHED');
    }
    return list;
  }, [seasonMatches, hideEndedMatches]);

  const [settingBetForMatch, setSettingBetForMatch] =
    useState<MatchData | null>(null);
  const isSetBetDialogOpen = Boolean(settingBetForMatch);
  const onSetBetClick = useCallback((match: MatchData) => {
    setSettingBetForMatch(match);
  }, []);

  const [updatingScoreForMatch, setUpdatingScoreForMatch] =
    useState<MatchData | null>(null);
  const isUpdateScoreDialogOpen = Boolean(updatingScoreForMatch);
  const onUpdateScoreClick = useCallback((match: MatchData) => {
    setUpdatingScoreForMatch(match);
  }, []);

  const renderListEmpty = useCallback(() => {
    if (!seasonId) {
      return (
        <Text
          variant="bodySmall"
          style={{ color: '#a1a1aa', marginBottom: 16 }}
        >
          Select a championship / season above to see fixtures.
        </Text>
      );
    }
    if (matchesPending) {
      return <ActivityIndicator style={{ marginBottom: 24 }} />;
    }
    return (
      <Text variant="bodySmall" style={{ color: '#a1a1aa', marginBottom: 24 }}>
        No matches for this season yet.
      </Text>
    );
  }, [seasonId, matchesPending]);

  if (seasonsPending || matchesPending) {
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

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          <LabeledSelectMenu
            label="Championship & season"
            options={championshipSeasonOptions}
            value={seasonId}
            onSelect={setSeasonId}
            getOptionLabel={championshipSeasonLabel}
            placeholder="Select championship and season"
            emptyMessage="No seasons available"
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'space-between',
            }}
          >
            <PressableCheckbox
              checked={hideEndedMatches}
              onPress={() => setHideEndedMatches((v) => !v)}
              label="Hide ended matches"
            />

            <PressableCheckbox
              checked={groupByDate}
              onPress={() => setGroupByDate((v) => !v)}
              label="Group by date"
            />
          </View>
        </View>

        <Divider style={{ marginBottom: 8 }} />

        <MatchesSectionList
          matches={matches}
          onSetBetClick={onSetBetClick}
          onUpdateScoreClick={me?.isAdmin ? onUpdateScoreClick : undefined}
          listEmptyComponent={renderListEmpty}
          refreshing={isRefetching ?? false}
          onRefresh={refetchSeasonMatches}
          groupByDate={groupByDate}
          showChampionship={false}
          showStanding={groupByDate}
          showOnlyStartTime={groupByDate}
        />
      </View>
      <SetMatchBetDialog
        open={isSetBetDialogOpen}
        match={settingBetForMatch}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSettingBetForMatch(null);
          }
        }}
      />
      <UpdateMatchScoreDialog
        open={isUpdateScoreDialogOpen}
        match={updatingScoreForMatch}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setUpdatingScoreForMatch(null);
          }
        }}
      />
    </Screen>
  );
}
