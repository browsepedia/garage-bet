import { MatchData } from '@garage-bet/models';
import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView, YStack } from 'tamagui';
import MatchCard from '../../components/MatchCard';
import { Screen } from '../../components/Screen';
import SetMatchBetDialog from '../../components/SetMatchBetDialog';
import { useMatchesQuery } from '../../queries/matches.query';

export default function Matches() {
  const { data, isLoading, isRefetching, error, refetch } = useMatchesQuery();

  const matches = data ?? [];

  const [settingBetForMatch, setSettingBetForMatch] =
    useState<MatchData | null>(null);

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
        {settingBetForMatch && (
          <SetMatchBetDialog
            match={settingBetForMatch}
            onClose={() => setSettingBetForMatch(null)}
          />
        )}
        <YStack gap={16}>
          {matches.map((match) => (
            <MatchCard
              onSetBetClick={() => setSettingBetForMatch(match)}
              key={match.id}
              match={match}
            />
          ))}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
