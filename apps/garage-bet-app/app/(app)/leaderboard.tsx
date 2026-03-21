import { LeaderboardEntry } from '@garage-bet/models';
import { Text } from 'react-native-paper';
import { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { useLeaderboardQuery } from '../../queries/leaderboard.query';

const LEFT_POSITION_WIDTH = 40;
const LEFT_PLAYER_WIDTH = 160;
const POINTS_WIDTH = 40;
const LEFT_TABLE_WIDTH = LEFT_POSITION_WIDTH + LEFT_PLAYER_WIDTH;

const RIGHT_COLUMN_WIDTH = 40;
const FULL_TABLE_WIDTH =
  LEFT_TABLE_WIDTH + POINTS_WIDTH + RIGHT_COLUMN_WIDTH * 6;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 48;

const horizontalColumns = [
  { key: 'finalBetPoints', label: 'F' },
  { key: 'totalWins', label: 'W' },
  { key: 'totalResults', label: 'R' },
  { key: 'totalLosses', label: 'L' },
  { key: 'betCount', label: 'T' },
  { key: 'winRate', label: 'WR' },
] as const;

export default function Leaderboard() {
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

  const leftListRef = useRef<FlatList<LeaderboardEntry>>(null);

  const renderHeaderCell = (label: string, width: number) => (
    <Text
      style={{
        color: '#94a3b8',
        width,
        height: HEADER_HEIGHT,
        lineHeight: HEADER_HEIGHT,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Text>
  );

  const renderLeftRow = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const position = index + 1;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#273042',
          height: ROW_HEIGHT,
        }}
      >
        <Text style={{ width: LEFT_POSITION_WIDTH, fontWeight: '700' }}>
          {position}
        </Text>

        <View
          style={{
            width: LEFT_PLAYER_WIDTH,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
          <Text
            style={{ flex: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
        </View>
      </View>
    );
  };

  const renderMainRow = ({ item }: { item: LeaderboardEntry }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#273042',
          height: ROW_HEIGHT,
        }}
      >
        <View style={{ width: LEFT_TABLE_WIDTH }} />

        <Text
          style={{ width: POINTS_WIDTH, fontWeight: '700', color: '#EA580C' }}
        >
          {item.totalPoints}
        </Text>

        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>
          {item.finalBetPoints}
        </Text>
        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>{item.totalWins}</Text>
        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>{item.totalResults}</Text>
        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>{item.totalLosses}</Text>
        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>{item.betCount}</Text>
        <Text style={{ width: RIGHT_COLUMN_WIDTH }}>
          {Math.round(item.winRate * 100)}%
        </Text>
      </View>
    );
  };

  return (
    <Screen>
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
          <View style={{ flex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ width: FULL_TABLE_WIDTH, flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#273042',
                    height: HEADER_HEIGHT,
                  }}
                >
                  <View style={{ width: LEFT_TABLE_WIDTH }} />
                  {renderHeaderCell('P', POINTS_WIDTH)}
                  {horizontalColumns.map((column) => (
                    <Text
                      key={column.key}
                      style={{
                        width: RIGHT_COLUMN_WIDTH,
                        color: '#94a3b8',
                        fontSize: 12,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                      }}
                    >
                      {column.label}
                    </Text>
                  ))}
                </View>

                <FlatList
                  data={entries}
                  keyExtractor={(item) => item.userId}
                  renderItem={renderMainRow}
                  refreshControl={
                    <RefreshControl
                      refreshing={Boolean(isRefetching) && !isLoading}
                      onRefresh={refetch}
                    />
                  }
                  onScroll={(event) => {
                    leftListRef.current?.scrollToOffset({
                      offset: event.nativeEvent.contentOffset.y,
                      animated: false,
                    });
                  }}
                  scrollEventThrottle={16}
                  onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.4}
                  ListFooterComponent={
                    isFetchingNextPage ? (
                      <View style={{ paddingVertical: 12 }}>
                        <ActivityIndicator />
                      </View>
                    ) : null
                  }
                />
              </View>
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: LEFT_TABLE_WIDTH,
                backgroundColor: '#111418',
                pointerEvents: 'none',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: '#273042',
                  height: HEADER_HEIGHT,
                }}
              >
                {renderHeaderCell('Pos', LEFT_POSITION_WIDTH)}
                {renderHeaderCell('Player', LEFT_PLAYER_WIDTH)}
              </View>
              <FlatList
                ref={leftListRef}
                data={entries}
                keyExtractor={(item) => item.userId}
                renderItem={renderLeftRow}
                scrollEnabled={false}
                ListFooterComponent={
                  isFetchingNextPage ? <View style={{ height: 36 }} /> : null
                }
              />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
