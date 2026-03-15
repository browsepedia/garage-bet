import { MatchData } from '@garage-bet/models';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import MatchCard from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import SetMatchBetDialog from '../../components/SetMatchBetDialog';
import { useMatchesQuery } from '../../queries/matches.query';

export default function Matches() {
  const { data, isRefetching, refetch } = useMatchesQuery();

  const matches = data ?? [];

  const [settingBetForMatch, setSettingBetForMatch] =
    useState<MatchData | null>(null);
  const isSetBetDialogOpen = Boolean(settingBetForMatch);
  const onSetBetClick = useCallback((match: MatchData) => {
    setSettingBetForMatch(match);
  }, []);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching ?? false}
            onRefresh={refetch}
          />
        }
      >
        <View>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSetBetClick={onSetBetClick}
            />
          ))}
        </View>
      </ScrollView>
      <SetMatchBetDialog
        open={isSetBetDialogOpen}
        match={settingBetForMatch}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSettingBetForMatch(null);
          }
        }}
      />
    </Screen>
  );
}
