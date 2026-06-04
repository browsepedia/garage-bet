import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LeaderboardEntry } from '@garage-bet/models';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import ChampionshipSeasonSelect from '../../components/ChampionshipSeasonSelect';
import { Screen } from '../../components/Screen';
import { useLeaderboardQuery } from '../../queries/leaderboard.query';
import { useUserProfileQuery } from '../../queries/user-profile.query';
import { AppTheme } from '../../theme';

const COL_POS = 40;
const COL_PLAYER_MIN = 100;
const COL_STAT = 40;
const COL_WR = 44;
const COL_COMPARE = 44;

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 48;

const HIGHLIGHT_BG = 'rgba(234, 88, 12, 0.15)';

const headerTextStyle = {
  color: '#94a3b8',
  height: HEADER_HEIGHT,
  lineHeight: HEADER_HEIGHT,
  fontSize: 12,
  fontWeight: '700' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
};

export default function Leaderboard() {
  const { data: me } = useUserProfileQuery();
  const [seasonId, setSeasonId] = useState<string | 'all'>('all');
  const theme = useTheme<AppTheme>();

  const { data, isLoading, isRefetching, refetch, error } =
    useLeaderboardQuery(seasonId);

  const entries = useMemo(() => data ?? [], [data]);

  const renderRow = useCallback(
    ({ item, index }: { item: LeaderboardEntry; index: number }) => {
      const isMe = item.userId === me?.id;
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: ROW_HEIGHT,
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderBottomColor: '#273042',
            backgroundColor: isMe ? HIGHLIGHT_BG : 'transparent',
          }}
        >
          <Text
            style={{
              width: COL_POS,
              fontWeight: '700',
              paddingLeft: theme.spacing(1),
            }}
          >
            {index + 1}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}'s stats`}
            hitSlop={4}
            onPress={() =>
              router.push(`/player-stats/${encodeURIComponent(item.userId)}`)
            }
            style={{
              flex: 1,
              minWidth: COL_PLAYER_MIN,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing(1),
            }}
          >
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
            <Text
              style={{ flex: 1, textTransform: 'capitalize' }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </TouchableOpacity>
          <Text
            style={{ width: COL_STAT, fontWeight: '700', color: '#EA580C' }}
          >
            {item.totalPoints}
          </Text>
          <Text style={{ width: COL_STAT }}>{item.totalWins}</Text>
          <Text style={{ width: COL_STAT }}>{item.totalResults}</Text>
          <Text style={{ width: COL_STAT }}>{item.totalLosses}</Text>
          <Text style={{ width: COL_WR }}>
            {Math.round(item.winRate * 100)}%
          </Text>
          {isMe ? (
            <View style={{ width: COL_COMPARE, height: ROW_HEIGHT }} />
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Compare with ${item.name}`}
              hitSlop={8}
              onPress={() =>
                router.push(`/compare/${encodeURIComponent(item.userId)}`)
              }
              style={{
                width: COL_COMPARE,
                height: ROW_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="compare-horizontal"
                size={22}
                color="#EA580C"
              />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [me?.id, theme],
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View
        style={{
          paddingHorizontal: theme.spacing(2),
          paddingRight: theme.spacing(0),
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: theme.spacing(1),
        }}
      >
        <View style={{ flex: 1 }}>
          <ChampionshipSeasonSelect
            useAllSeasons
            label="Championship"
            value={seasonId}
            onChange={setSeasonId}
            placeholder="Select championship"
            emptyMessage="No championships available"
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Refresh leaderboard"
          onPress={() => refetch()}
          disabled={isRefetching}
          hitSlop={8}
          style={{
            height: 44,
            width: 44,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isRefetching ? 0.6 : 1,
          }}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color="#EA580C" />
          ) : (
            <MaterialCommunityIcons name="refresh" size={22} color="#EA580C" />
          )}
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingTop: theme.spacing(1) }}>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>Error: {error.message}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: HEADER_HEIGHT,
                borderBottomWidth: 1,
                borderBottomColor: '#273042',
              }}
            >
              <Text
                style={{
                  ...headerTextStyle,
                  width: COL_POS,
                  paddingLeft: theme.spacing(1),
                }}
              >
                #
              </Text>
              <Text
                style={{
                  ...headerTextStyle,
                  flex: 1,
                  minWidth: COL_PLAYER_MIN,
                }}
              >
                Player
              </Text>
              <Text style={{ ...headerTextStyle, width: COL_STAT }}>P</Text>
              <Text style={{ ...headerTextStyle, width: COL_STAT }}>W</Text>
              <Text style={{ ...headerTextStyle, width: COL_STAT }}>R</Text>
              <Text style={{ ...headerTextStyle, width: COL_STAT }}>L</Text>
              <Text style={{ ...headerTextStyle, width: COL_WR }}>WR</Text>
              <View
                style={{
                  width: COL_COMPARE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: HEADER_HEIGHT,
                }}
              >
                <MaterialCommunityIcons
                  name="compare-horizontal"
                  size={18}
                  color="#64748b"
                />
              </View>
            </View>
            <FlatList
              data={entries}
              keyExtractor={(item) => item.userId}
              renderItem={renderRow}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={Boolean(isRefetching) && !isLoading}
                  onRefresh={refetch}
                  progressViewOffset={0}
                  progressBackgroundColor="#1e293b"
                  tintColor="#ea580c"
                  colors={['#ea580c']}
                />
              }
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
