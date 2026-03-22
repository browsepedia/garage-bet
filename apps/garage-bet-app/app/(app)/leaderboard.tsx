import { LeaderboardEntry } from '@garage-bet/models';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { useLeaderboardQuery } from '../../queries/leaderboard.query';

const COL_POS = 40;
const COL_PLAYER = 168;
const COL_STAT = 40;
const COL_WR = 44;

const TABLE_WIDTH = COL_POS + COL_PLAYER + COL_STAT * 5 + COL_WR + COL_STAT; // P,W,R,L,T + WR + FB

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 48;

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

  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#273042',
        height: HEADER_HEIGHT,
      }}
    >
      <Text style={{ ...headerTextStyle, width: COL_POS }}>#</Text>
      <Text style={{ ...headerTextStyle, width: COL_PLAYER }}>Player</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>P</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>W</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>R</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>L</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>T</Text>
      <Text style={{ ...headerTextStyle, width: COL_WR }}>WR</Text>
      <Text style={{ ...headerTextStyle, width: COL_STAT }}>FB</Text>
    </View>
  );

  const renderRow = ({
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
        <Text style={{ width: COL_POS, fontWeight: '700' }}>{position}</Text>

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

        <Text style={{ width: COL_STAT, fontWeight: '700', color: '#EA580C' }}>
          {item.totalPoints}
        </Text>
        <Text style={{ width: COL_STAT }}>{item.totalWins}</Text>
        <Text style={{ width: COL_STAT }}>{item.totalResults}</Text>
        <Text style={{ width: COL_STAT }}>{item.totalLosses}</Text>
        <Text style={{ width: COL_STAT }}>{item.betCount}</Text>
        <Text style={{ width: COL_WR }}>{Math.round(item.winRate * 100)}%</Text>
        <Text style={{ width: COL_STAT }}>{item.finalBetPoints}</Text>
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
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ width: TABLE_WIDTH, flex: 1 }}>
              {renderHeader()}
              <FlatList
                data={entries}
                keyExtractor={(item) => item.userId}
                renderItem={renderRow}
                nestedScrollEnabled
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
                    <View style={{ paddingVertical: 12 }}>
                      <ActivityIndicator />
                    </View>
                  ) : null
                }
              />
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
