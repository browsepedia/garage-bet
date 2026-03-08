import { MatchData } from '@garage-bet/models';
import { ScrollView } from '@tamagui/scroll-view';
import { YStack } from '@tamagui/stacks';
import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
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
        <YStack gap={16}>
          {matches.map((match) => (
            <MatchCard
              onSetBetClick={onSetBetClick}
              key={match.id}
              match={match}
            />
          ))}
        </YStack>
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
