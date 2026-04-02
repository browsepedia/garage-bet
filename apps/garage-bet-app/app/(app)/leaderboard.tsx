import { LeaderboardEntry } from '@garage-bet/models';
import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { useLeaderboardQuery } from '../../queries/leaderboard.query';
import { useUserProfileQuery } from '../../queries/user-profile.query';

const COL_POS = 40;
const COL_PLAYER = 168;
const COL_STAT = 40;
const COL_WR = 44;

const FIXED_WIDTH = COL_POS + COL_PLAYER;
const SCROLLABLE_WIDTH = COL_STAT * 5 + COL_WR + COL_STAT;

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

const HIGHLIGHT_BG = 'rgba(234, 88, 12, 0.15)';

/** Same on both lists so synced scrolling does not rubber-band on only one side (iOS/Android). */
const FLAT_LIST_SCROLL_PROPS = {
  bounces: false,
  alwaysBounceVertical: false,
  overScrollMode: 'never' as const,
};

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
  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useLeaderboardQuery();

  const entries = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page),
    [data?.pages],
  );

  const fixedRef = useRef<FlatList>(null);
  const scrollableRef = useRef<FlatList>(null);
  const scrollSource = useRef<'left' | 'right' | null>(null);

  const handleFixedScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollSource.current === 'left') {
        scrollableRef.current?.scrollToOffset({
          offset: e.nativeEvent.contentOffset.y,
          animated: false,
        });
      }
    },
    [],
  );

  const handleScrollableScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollSource.current === 'right') {
        fixedRef.current?.scrollToOffset({
          offset: e.nativeEvent.contentOffset.y,
          animated: false,
        });
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
          <Text style={{ width: COL_POS, fontWeight: '700', paddingLeft: 8 }}>
            {index + 1}
          </Text>
          <View
            style={{
              width: COL_PLAYER,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
            <Text style={{ flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
          </View>
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

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={{ flex: 1, paddingTop: 8 }}>
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
                    paddingLeft: 8,
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
                refreshControl={
                  <RefreshControl
                    refreshing={Boolean(isRefetching) && !isLoading}
                    onRefresh={refetch}
                  />
                }
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
                        paddingVertical: 12,
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
                  ListFooterComponent={
                    isFetchingNextPage ? (
                      <View style={{ height: FOOTER_HEIGHT }} />
                    ) : null
                  }
                />
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Screen>
  );
}
