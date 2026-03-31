import type { MatchData } from '@garage-bet/models';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { MatchesSectionList } from '../../components/MatchesSectionList';
import { Screen } from '../../components/Screen';
import SetMatchBetDialog from '../../components/SetMatchBetDialog';
import { useMatchesByDayQuery } from '../../queries/matches-by-day.query';
import {
  formatInUserTimezone,
  getDeviceIanaTimeZone,
  getTodayYyyyMmDdInTimeZone,
} from '../../utils/format-date';

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const timeZone = useMemo(() => getDeviceIanaTimeZone(), []);
  const [calendarDay, setCalendarDay] = useState(() =>
    getTodayYyyyMmDdInTimeZone(timeZone),
  );

  const {
    data: dayMatches,
    isPending,
    isRefetching,
    refetch,
  } = useMatchesByDayQuery(calendarDay, timeZone);

  useFocusEffect(
    useCallback(() => {
      setCalendarDay(getTodayYyyyMmDdInTimeZone(timeZone));
      void queryClient.invalidateQueries({ queryKey: ['matches', 'day'] });
    }, [timeZone, queryClient]),
  );

  const [settingBetForMatch, setSettingBetForMatch] =
    useState<MatchData | null>(null);
  const isSetBetDialogOpen = Boolean(settingBetForMatch);
  const onSetBetClick = useCallback((match: MatchData) => {
    setSettingBetForMatch(match);
  }, []);

  const subtitle = formatInUserTimezone(
    new Date().toISOString(),
    'EEEE, d MMMM yyyy',
    timeZone,
  );

  const renderListEmpty = useCallback(() => {
    if (isPending) {
      return <ActivityIndicator style={{ marginBottom: 24 }} />;
    }
    return (
      <Text variant="bodySmall" style={{ color: '#a1a1aa', marginBottom: 24 }}>
        No matches scheduled for this day.
      </Text>
    );
  }, [isPending]);

  if (isPending && !dayMatches) {
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
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text variant="headlineSmall">Today</Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa', marginTop: 4 }}>
            {subtitle}
          </Text>
        </View>

        <Divider style={{ marginBottom: 8 }} />

        <MatchesSectionList
          matches={dayMatches ?? []}
          onSetBetClick={onSetBetClick}
          listEmptyComponent={renderListEmpty}
          groupByChampionship
          refreshing={isRefetching ?? false}
          onRefresh={refetch}
          showStanding={false}
          showChampionship={false}
          showOnlyStartTime
        />
      </View>
      <SetMatchBetDialog
        open={isSetBetDialogOpen}
        match={settingBetForMatch}
        onOpenChange={(nextOpen: boolean) => {
          if (!nextOpen) {
            setSettingBetForMatch(null);
          }
        }}
      />
    </Screen>
  );
}
