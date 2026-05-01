import type { MatchData } from '@garage-bet/models';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { MatchesSectionList } from '../../components/MatchesSectionList';
import { Screen } from '../../components/Screen';
import SetMatchBetDialog from '../../components/SetMatchBetDialog';
import UpdateMatchScoreDialog from '../../components/UpdateMatchScoreDialog';
import { useMatchesByDayQuery } from '../../queries/matches-by-day.query';
import { useUserProfileQuery } from '../../queries/user-profile.query';
import { AppTheme } from '../../theme';
import {
  formatInUserTimezone,
  getDeviceIanaTimeZone,
  getTodayYYYYMMDDInTimeZone,
} from '../../utils/format-date';

export default function TodayScreen() {
  const { data: me } = useUserProfileQuery();
  const queryClient = useQueryClient();
  const timeZone = useMemo(() => getDeviceIanaTimeZone(), []);
  const [calendarDay, setCalendarDay] = useState(() =>
    getTodayYYYYMMDDInTimeZone(timeZone),
  );
  const theme = useTheme<AppTheme>();
  const {
    data: dayMatches,
    isPending,
    isRefetching,
    refetch,
  } = useMatchesByDayQuery(calendarDay, timeZone);

  useFocusEffect(
    useCallback(() => {
      setCalendarDay(getTodayYYYYMMDDInTimeZone(timeZone));
      void queryClient.invalidateQueries({ queryKey: ['matches', 'day'] });
    }, [timeZone, queryClient]),
  );

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

  const subtitle = formatInUserTimezone(
    new Date().toISOString(),
    'EEEE, d MMMM yyyy',
    timeZone,
  );

  const renderListEmpty = useCallback(() => {
    if (isPending) {
      return <ActivityIndicator style={{ marginBottom: theme.spacing(3) }} />;
    }
    return (
      <Text
        variant="bodySmall"
        style={{
          color: '#a1a1aa',
          marginBottom: theme.spacing(3),
          textAlign: 'center',
          paddingTop: theme.spacing(3),
        }}
      >
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
        <View
          style={{
            paddingHorizontal: theme.spacing(2),
            paddingBottom: theme.spacing(1),
          }}
        >
          <Text variant="headlineSmall">Today</Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa', marginTop: 4 }}>
            {subtitle}
          </Text>
        </View>

        <Divider style={{ marginBottom: theme.spacing(1) }} />

        <MatchesSectionList
          matches={dayMatches ?? []}
          onSetBetClick={onSetBetClick}
          onUpdateScoreClick={me?.isAdmin ? onUpdateScoreClick : undefined}
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
      <UpdateMatchScoreDialog
        open={isUpdateScoreDialogOpen}
        match={updatingScoreForMatch}
        onOpenChange={(nextOpen: boolean) => {
          if (!nextOpen) {
            setUpdatingScoreForMatch(null);
          }
        }}
      />
    </Screen>
  );
}
