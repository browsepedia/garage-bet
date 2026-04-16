import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { UserStats } from '@garage-bet/models';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from './Button';
import { RadarChart } from './RadarChart';
import { Screen } from './Screen';
import type { AppTheme } from '../theme';
import { buildRadarAxes } from '../utils/user-stats-radar';

const MUTED = '#a1a1aa';
const BORDER = '#273042';
const CARD_BG = '#13161a';

function StatRow({
  icon,
  label,
  value,
  accent,
  iconColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
  iconColor?: string;
}) {
  const theme = useTheme<AppTheme>();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        gap: 12,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={iconColor ? iconColor : accent ? theme.colors.primary : MUTED}
      />
      <Text style={{ flex: 1, color: MUTED }} variant="bodyMedium">
        {label}
      </Text>
      <Text
        style={{ fontWeight: '700', color: theme.colors.primary }}
        variant="bodyLarge"
      >
        {value}
      </Text>
    </View>
  );
}

type UserStatsScreenContentProps = {
  title: string;
  data: UserStats | undefined;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

export function UserStatsScreenContent({
  title,
  data,
  isPending,
  isRefetching,
  isError,
  error,
  refetch,
}: UserStatsScreenContentProps) {
  const theme = useTheme<AppTheme>();
  const { width } = useWindowDimensions();

  const chartSize = Math.min(Math.max(200, width - 60), 400);
  const wrPct =
    data && data.maxPoints > 0
      ? Math.round((data.points / data.maxPoints) * 100)
      : 0;
  const overallWrPct =
    data && data.totalFinishedMatches > 0
      ? Math.round((data.points / (data.totalFinishedMatches * 3)) * 100)
      : 0;
  const coveragePct =
    data && data.totalFinishedMatches > 0
      ? Math.round((data.bets / data.totalFinishedMatches) * 100)
      : 0;

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/today')
          }
          hitSlop={12}
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={{ flex: 1, fontWeight: '700' }}>
          {title}
        </Text>
      </View>

      {isPending ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator color="#EA580C" />
        </View>
      ) : isError ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
            {error instanceof Error ? error.message : 'Could not load stats.'}
          </Text>
          <Button mode="contained" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      ) : data ? (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isPending}
              onRefresh={() => refetch()}
              tintColor="#EA580C"
            />
          }
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: CARD_BG,
            }}
          >
            <Image
              source={{ uri: data.avatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="titleMedium" numberOfLines={2}>
                {data.name}
              </Text>
              <Text variant="bodySmall" style={{ color: MUTED, marginTop: 4 }}>
                Rank #{data.rank} of {data.totalPlayers} · {data.points} pts
              </Text>
            </View>
          </View>

          <View
            style={{
              alignItems: 'center',
              marginBottom: 20,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: CARD_BG,
            }}
          >
            <Text
              variant="labelMedium"
              style={{
                color: MUTED,
                marginBottom: 6,
                alignSelf: 'flex-start',
              }}
            >
              PERFORMANCE OVERVIEW
            </Text>
            <RadarChart
              axes={buildRadarAxes(data)}
              size={chartSize}
              color={theme.colors.primary}
              gridColor={BORDER}
              labelColor={MUTED}
            />
          </View>

          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: CARD_BG,
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            <StatRow
              icon="star"
              label="Total points"
              value={`${data.points}`}
              accent
            />

            <StatRow
              icon="lightning-bolt"
              iconColor={theme.colors.warning}
              label="Max available points"
              value={`${data.maxPoints}`}
            />

            <StatRow
              icon="check-decagram"
              iconColor={theme.colors.success}
              label="Exact scores (×3 pts)"
              value={`${data.wins} / ${data.bets} `}
              accent
            />
            <StatRow
              icon="target"
              iconColor={theme.colors.info}
              label="Correct results (×1 pt)"
              value={`${data.results} / ${data.bets}`}
            />
            <StatRow
              icon="close-circle-outline"
              iconColor={theme.colors.error}
              label="Wrong predictions"
              value={`${data.losses} / ${data.bets}`}
            />

            <StatRow
              icon="chart-line"
              label="Point percentage (PP) (on bets placed)"
              value={`${wrPct}%`}
              accent
            />
            <StatRow
              icon="chart-line-variant"
              label="Overall point percentage (PP) (all matches)"
              value={`${overallWrPct}%`}
              accent
            />
            <StatRow
              icon="soccer"
              label="Bets placed on finished matches"
              value={`${data.bets} / ${data.totalFinishedMatches} (${coveragePct}%)`}
            />

            <StatRow
              icon="flag-checkered"
              label="Final bet bonus"
              value={`+${data.finalBetPoints} pts`}
            />
            <View
              style={{
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <MaterialCommunityIcons
                name="trophy-outline"
                size={20}
                color={MUTED}
              />
              <Text style={{ flex: 1, color: MUTED }} variant="bodyMedium">
                Leaderboard rank
              </Text>
              <Text
                style={{ fontWeight: '700', color: theme.colors.primary }}
                variant="bodyLarge"
              >
                #{data.rank}{' '}
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  / {data.totalPlayers}
                </Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/leaderboard')}
            style={{
              paddingVertical: 14,
              alignItems: 'center',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              View full leaderboard
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </Screen>
  );
}
