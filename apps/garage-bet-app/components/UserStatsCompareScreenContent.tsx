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
import { RadarCompareChart } from './RadarCompareChart';
import { Screen } from './Screen';
import type { AppTheme } from '../theme';
import { buildRadarAxes } from '../utils/user-stats-radar';

const MUTED = '#a1a1aa';
const BORDER = '#273042';
const CARD_BG = '#13161a';

function CompareStatRow({
  icon,
  label,
  valuePrimary,
  valueSecondary,
  accent,
  iconColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  valuePrimary: string;
  valueSecondary: string;
  accent?: boolean;
  iconColor?: string;
}) {
  const theme = useTheme<AppTheme>();
  const iconTint = iconColor
    ? iconColor
    : accent
      ? theme.colors.primary
      : MUTED;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        gap: 8,
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={iconTint} />
      <Text style={{ flex: 1, color: MUTED }} variant="bodyMedium">
        {label}
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color: theme.colors.primary,
          minWidth: 76,
          textAlign: 'right',
        }}
        variant="bodyMedium"
        numberOfLines={2}
      >
        {valuePrimary}
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color: theme.colors.info,
          minWidth: 76,
          textAlign: 'right',
        }}
        variant="bodyMedium"
        numberOfLines={2}
      >
        {valueSecondary}
      </Text>
    </View>
  );
}

type UserStatsCompareScreenContentProps = {
  title: string;
  primaryLabel: string;
  secondaryLabel: string;
  me: UserStats | undefined;
  other: UserStats | undefined;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

export function UserStatsCompareScreenContent({
  title,
  primaryLabel,
  secondaryLabel,
  me,
  other,
  isPending,
  isRefetching,
  isError,
  error,
  refetch,
}: UserStatsCompareScreenContentProps) {
  const theme = useTheme<AppTheme>();
  const { width } = useWindowDimensions();
  const chartSize = Math.min(Math.max(200, width - 60), 400);

  const wrPct = (s: UserStats) =>
    s.maxPoints > 0 ? Math.round((s.points / s.maxPoints) * 100) : 0;
  const overallWrPct = (s: UserStats) =>
    s.totalFinishedMatches > 0
      ? Math.round((s.points / (s.totalFinishedMatches * 3)) * 100)
      : 0;
  const coveragePct = (s: UserStats) =>
    s.totalFinishedMatches > 0
      ? Math.round((s.bets / s.totalFinishedMatches) * 100)
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
      ) : me && other ? (
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
              gap: 10,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: BORDER,
                backgroundColor: CARD_BG,
                minWidth: 0,
              }}
            >
              <Image
                source={{ uri: me.avatarUrl }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="titleSmall" numberOfLines={2}>
                  {me.name}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: MUTED, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {primaryLabel} · #{me.rank} · {me.points} pts
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: BORDER,
                backgroundColor: CARD_BG,
                minWidth: 0,
              }}
            >
              <Image
                source={{ uri: other.avatarUrl }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="titleSmall" numberOfLines={2}>
                  {other.name}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: MUTED, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {secondaryLabel} · #{other.rank} · {other.points} pts
                </Text>
              </View>
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
            <RadarCompareChart
              primaryAxes={buildRadarAxes(me)}
              secondaryAxes={buildRadarAxes(other)}
              size={chartSize}
              primaryColor={theme.colors.primary}
              secondaryColor={theme.colors.info}
              gridColor={BORDER}
              labelColor={MUTED}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginTop: 10,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.primary,
                  }}
                />
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  {me.name}
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.info,
                  }}
                />
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  {other.name}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: CARD_BG,
              paddingHorizontal: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingLeft: 28,
                borderBottomWidth: 1,
                borderBottomColor: BORDER,
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  minWidth: 76,
                  textAlign: 'right',
                  color: theme.colors.primary,
                  fontWeight: '700',
                  fontSize: 11,
                }}
                numberOfLines={1}
              >
                {primaryLabel}
              </Text>
              <Text
                style={{
                  minWidth: 76,
                  textAlign: 'right',
                  color: theme.colors.info,
                  fontWeight: '700',
                  fontSize: 11,
                }}
                numberOfLines={1}
              >
                {secondaryLabel}
              </Text>
            </View>

            <CompareStatRow
              icon="star"
              label="Total points"
              valuePrimary={`${me.points}`}
              valueSecondary={`${other.points}`}
              accent
            />
            <CompareStatRow
              icon="lightning-bolt"
              iconColor={theme.colors.warning}
              label="Max available points"
              valuePrimary={`${me.maxPoints}`}
              valueSecondary={`${other.maxPoints}`}
            />
            <CompareStatRow
              icon="check-decagram"
              iconColor={theme.colors.success}
              label="Exact scores (×3 pts)"
              valuePrimary={`${me.wins} / ${me.bets}`}
              valueSecondary={`${other.wins} / ${other.bets}`}
              accent
            />
            <CompareStatRow
              icon="target"
              iconColor={theme.colors.info}
              label="Correct results (×1 pt)"
              valuePrimary={`${me.results} / ${me.bets}`}
              valueSecondary={`${other.results} / ${other.bets}`}
            />
            <CompareStatRow
              icon="close-circle-outline"
              iconColor={theme.colors.error}
              label="Wrong predictions"
              valuePrimary={`${me.losses} / ${me.bets}`}
              valueSecondary={`${other.losses} / ${other.bets}`}
            />
            <CompareStatRow
              icon="chart-line"
              label="Point percentage (PP) (on bets placed)"
              valuePrimary={`${wrPct(me)}%`}
              valueSecondary={`${wrPct(other)}%`}
              accent
            />
            <CompareStatRow
              icon="chart-line-variant"
              label="Overall point percentage (PP) (all matches)"
              valuePrimary={`${overallWrPct(me)}%`}
              valueSecondary={`${overallWrPct(other)}%`}
              accent
            />
            <CompareStatRow
              icon="soccer"
              label="Bets on finished matches"
              valuePrimary={`${me.bets} / ${me.totalFinishedMatches} (${coveragePct(me)}%)`}
              valueSecondary={`${other.bets} / ${other.totalFinishedMatches} (${coveragePct(other)}%)`}
            />
            <CompareStatRow
              icon="flag-checkered"
              label="Final bet bonus"
              valuePrimary={`+${me.finalBetPoints} pts`}
              valueSecondary={`+${other.finalBetPoints} pts`}
            />
            <View
              style={{
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
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
                style={{
                  fontWeight: '700',
                  color: theme.colors.primary,
                  minWidth: 76,
                  textAlign: 'right',
                }}
                variant="bodyMedium"
              >
                #{me.rank}{' '}
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  / {me.totalPlayers}
                </Text>
              </Text>
              <Text
                style={{
                  fontWeight: '700',
                  color: theme.colors.info,
                  minWidth: 76,
                  textAlign: 'right',
                }}
                variant="bodyMedium"
              >
                #{other.rank}{' '}
                <Text variant="bodySmall" style={{ color: MUTED }}>
                  / {other.totalPlayers}
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
