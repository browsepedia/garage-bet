import type { MatchData } from '@garage-bet/models';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import ChampionshipSeasonSelect from '../../../components/ChampionshipSeasonSelect';
import { MatchesSectionList } from '../../../components/MatchesSectionList';
import PressableCheckbox from '../../../components/PressableCheckbox';
import { Screen } from '../../../components/Screen';
import SetMatchBetDialog from '../../../components/SetMatchBetDialog';
import UpdateMatchScoreDialog from '../../../components/UpdateMatchScoreDialog';
import { useMatchesQuery } from '../../../queries/matches.query';
import { useUserProfileQuery } from '../../../queries/user-profile.query';

export default function Matches() {
  const { data: me } = useUserProfileQuery();

  const [seasonId, setSeasonId] = useState<string | 'all'>('all');
  const [hideEndedMatches, setHideEndedMatches] = useState(true);
  const [groupByDate, setGroupByDate] = useState(true);

  const {
    data: seasonMatches,
    isRefetching,
    refetch: refetchSeasonMatches,
    isPending: matchesPending,
  } = useMatchesQuery(seasonId);

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

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          <ChampionshipSeasonSelect
            useAllSeasons
            label="Championship"
            value={seasonId}
            onChange={setSeasonId}
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
