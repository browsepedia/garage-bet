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
import { Button } from '../../components/Button';
import { RadarChart, type RadarAxis } from '../../components/RadarChart';
import { Screen } from '../../components/Screen';
import { useUserStatsQuery } from '../../queries/user-stats.query';
import type { AppTheme } from '../../theme';

const MUTED = '#a1a1aa';
const BORDER = '#273042';
const CARD_BG = '#13161a';

// ─── helpers ────────────────────────────────────────────────────────────────

function safe(v: number): number {
  return Number.isFinite(v) && v >= 0 ? Math.min(1, v) : 0;
}

function buildRadarAxes(s: UserStats): RadarAxis[] {
  const bets = s.bets || 1; // avoid ÷0
  const maxPts = s.maxPoints || 1;
  const total = s.totalPlayers || 1;
  return [
    {
      label: 'Win rate',
      value: safe(s.points / maxPts),
    },
    {
      label: 'Exact',
      value: safe(s.wins / bets),
    },
    {
      label: 'Result',
      value: safe(s.results / bets),
    },
    {
      label: 'No loss',
      value: safe(1 - s.losses / bets),
    },
    {
      label: 'Rank',
      value: safe((total - s.rank + 1) / total),
    },
  ];
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
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
        color={accent ? theme.colors.primary : MUTED}
      />
      <Text style={{ flex: 1, color: MUTED }} variant="bodyMedium">
        {label}
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color: accent ? theme.colors.primary : undefined,
        }}
        variant="bodyLarge"
      >
        {value}
      </Text>
    </View>
  );
}

// ─── screen ─────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const theme = useTheme<AppTheme>();
  const { width } = useWindowDimensions();
  const { data, isPending, isRefetching, isError, error, refetch } =
    useUserStatsQuery();

  const chartSize = Math.min(width - 32, 300);
  const wrPct =
    data && data.maxPoints > 0
      ? Math.round((data.points / data.maxPoints) * 100)
      : 0;

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      {/* Header */}
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
          Your stats
        </Text>
      </View>

      {/* Body */}
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
          {/* Profile card */}
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
              style={{ width: 60, height: 60, borderRadius: 30 }}
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

          {/* Radar chart */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 20,
              padding: 16,
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
                marginBottom: 12,
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

          {/* Stat rows */}
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
              label="Max available points"
              value={`${data.maxPoints}`}
            />
            <StatRow
              icon="chart-line"
              label="Win rate"
              value={`${wrPct}%`}
              accent
            />
            <StatRow
              icon="soccer"
              label="Bets on finished matches"
              value={`${data.bets}`}
            />
            <StatRow
              icon="check-decagram"
              label="Exact scores (×3 pts)"
              value={`${data.wins}`}
              accent
            />
            <StatRow
              icon="target"
              label="Correct results (×1 pt)"
              value={`${data.results}`}
            />
            <StatRow
              icon="close-circle-outline"
              label="Wrong predictions"
              value={`${data.losses}`}
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
              <Text style={{ fontWeight: '700' }} variant="bodyLarge">
                #{data.rank}{' '}
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  / {data.totalPlayers}
                </Text>
              </Text>
            </View>
          </View>

          {/* Leaderboard shortcut */}
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
