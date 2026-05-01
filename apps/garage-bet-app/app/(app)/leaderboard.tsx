import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LeaderboardEntry } from '@garage-bet/models';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
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
const COL_PLAYER = 168;
const COL_STAT = 40;
const COL_WR = 44;
/** Pinned compare action (always visible on the right). */
const COL_COMPARE = 48;

const FIXED_WIDTH = COL_POS + COL_PLAYER;
const SCROLLABLE_WIDTH = COL_STAT * 5 + COL_WR + COL_STAT;

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

const HIGHLIGHT_BG = 'rgba(234, 88, 12, 0.15)';

/**
 * FlatLists need vertical bounce / overscroll for RefreshControl pull-to-refresh.
 * Use the same on every synced column so rubber-banding stays aligned during pull.
 */
const FLAT_LIST_SCROLL_PROPS = {
  bounces: true,
  alwaysBounceVertical: true,
  /** Allows Android overscroll so pull-to-refresh can activate. */
  overScrollMode: 'auto' as const,
};

/**
 * One native RefreshControl per list = stacked spinners. Only the stats FlatList
 * mounts it; # / Player / compare lists stay bounce-synced via scroll offsets.
 */
const leaderboardRefreshControl = (props: {
  refreshing: boolean;
  onRefresh: () => void;
}) => (
  <RefreshControl
    {...props}
    progressViewOffset={0}
    progressBackgroundColor="#1e293b"
    tintColor="#ea580c"
    colors={['#ea580c']}
  />
);

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

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useLeaderboardQuery(seasonId);

  const entries = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page),
    [data?.pages],
  );

  const fixedRef = useRef<FlatList>(null);
  const scrollableRef = useRef<FlatList>(null);
  const compareRef = useRef<FlatList>(null);
  const scrollSource = useRef<'left' | 'right' | 'compare' | null>(null);

  const handleFixedScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollSource.current === 'left') {
        const offset = e.nativeEvent.contentOffset.y;
        scrollableRef.current?.scrollToOffset({ offset, animated: false });
        compareRef.current?.scrollToOffset({ offset, animated: false });
      }
    },
    [],
  );

  const handleScrollableScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollSource.current === 'right') {
        const offset = e.nativeEvent.contentOffset.y;
        fixedRef.current?.scrollToOffset({ offset, animated: false });
        compareRef.current?.scrollToOffset({ offset, animated: false });
      }
    },
    [],
  );

  const handleCompareScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollSource.current === 'compare') {
        const offset = e.nativeEvent.contentOffset.y;
        fixedRef.current?.scrollToOffset({ offset, animated: false });
        scrollableRef.current?.scrollToOffset({ offset, animated: false });
      }
    },
    [],
  );

  const renderFixedRow = useCallback(
    ({ item, index }: { item: LeaderboardEntry; index: number }) => {
      const isMe = item.userId === me?.id;
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: ROW_HEIGHT,
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
              width: COL_PLAYER,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing(1),
            }}
          >
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
            <Text style={{ flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [me?.id],
  );

  const renderScrollableRow = useCallback(
    ({ item }: { item: LeaderboardEntry }) => {
      const isMe = item.userId === me?.id;
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: ROW_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: '#273042',
            backgroundColor: isMe ? HIGHLIGHT_BG : 'transparent',
          }}
        >
          <Text
            style={{ width: COL_STAT, fontWeight: '700', color: '#EA580C' }}
          >
            {item.totalPoints}
          </Text>
          <Text style={{ width: COL_STAT }}>{item.totalWins}</Text>
          <Text style={{ width: COL_STAT }}>{item.totalResults}</Text>
          <Text style={{ width: COL_STAT }}>{item.totalLosses}</Text>
          <Text style={{ width: COL_STAT }}>{item.betCount}</Text>
          <Text style={{ width: COL_WR }}>
            {Math.round(item.winRate * 100)}%
          </Text>
          <Text style={{ width: COL_STAT }}>{item.finalBetPoints}</Text>
        </View>
      );
    },
    [me?.id],
  );

  const renderCompareRow = useCallback(
    ({ item }: { item: LeaderboardEntry }) => {
      const isMe = item.userId === me?.id;
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: ROW_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: '#273042',
            backgroundColor: isMe ? HIGHLIGHT_BG : 'transparent',
          }}
        >
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
    [me?.id],
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: theme.spacing(2) }}>
        <ChampionshipSeasonSelect
          useAllSeasons
          label="Championship"
          value={seasonId}
          onChange={setSeasonId}
          placeholder="Select championship"
          emptyMessage="No championships available"
        />
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
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* Sticky left columns (# + Player) */}
            <View style={{ width: FIXED_WIDTH }}>
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
                <Text style={{ ...headerTextStyle, width: COL_PLAYER }}>
                  Player
                </Text>
              </View>
              <FlatList
                ref={fixedRef}
                data={entries}
                keyExtractor={(item) => item.userId}
                renderItem={renderFixedRow}
                {...FLAT_LIST_SCROLL_PROPS}
                scrollEventThrottle={16}
                onScrollBeginDrag={() => {
                  scrollSource.current = 'left';
                }}
                onMomentumScrollEnd={() => {
                  scrollSource.current = null;
                }}
                onScroll={handleFixedScroll}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View
                      style={{
                        paddingVertical: theme.spacing(1.5),
                        height: FOOTER_HEIGHT,
                      }}
                    >
                      <ActivityIndicator />
                    </View>
                  ) : null
                }
              />
            </View>

            {/* Horizontally scrollable stat columns */}
            <ScrollView
              horizontal
              bounces={false}
              alwaysBounceHorizontal={false}
              overScrollMode="never"
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              nestedScrollEnabled
            >
              <View style={{ width: SCROLLABLE_WIDTH, flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: HEADER_HEIGHT,
                    borderBottomWidth: 1,
                    borderBottomColor: '#273042',
                  }}
                >
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>P</Text>
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>W</Text>
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>R</Text>
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>L</Text>
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>T</Text>
                  <Text style={{ ...headerTextStyle, width: COL_WR }}>WR</Text>
                  <Text style={{ ...headerTextStyle, width: COL_STAT }}>
                    FB
                  </Text>
                </View>
                <FlatList
                  ref={scrollableRef}
                  data={entries}
                  keyExtractor={(item) => item.userId}
                  renderItem={renderScrollableRow}
                  {...FLAT_LIST_SCROLL_PROPS}
                  scrollEventThrottle={16}
                  onScrollBeginDrag={() => {
                    scrollSource.current = 'right';
                  }}
                  onMomentumScrollEnd={() => {
                    scrollSource.current = null;
                  }}
                  onScroll={handleScrollableScroll}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  refreshControl={leaderboardRefreshControl({
                    refreshing: Boolean(isRefetching) && !isLoading,
                    onRefresh: refetch,
                  })}
                  ListFooterComponent={
                    isFetchingNextPage ? (
                      <View style={{ height: FOOTER_HEIGHT }} />
                    ) : null
                  }
                />
              </View>
            </ScrollView>

            {/* Pinned compare column */}
            <View
              style={{
                width: COL_COMPARE,
                borderLeftWidth: 1,
                borderLeftColor: '#273042',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: HEADER_HEIGHT,
                  borderBottomWidth: 1,
                  borderBottomColor: '#273042',
                }}
              >
                <MaterialCommunityIcons
                  name="compare-horizontal"
                  size={18}
                  color="#64748b"
                />
              </View>
              <FlatList
                ref={compareRef}
                data={entries}
                keyExtractor={(item) => item.userId}
                renderItem={renderCompareRow}
                {...FLAT_LIST_SCROLL_PROPS}
                scrollEventThrottle={16}
                onScrollBeginDrag={() => {
                  scrollSource.current = 'compare';
                }}
                onMomentumScrollEnd={() => {
                  scrollSource.current = null;
                }}
                onScroll={handleCompareScroll}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View style={{ height: FOOTER_HEIGHT }} />
                  ) : null
                }
              />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
