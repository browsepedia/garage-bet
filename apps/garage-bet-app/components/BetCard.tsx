import { MatchBetListItem } from '@garage-bet/models';
import { View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { useBetStatusColor } from '../utils/use-bet-status-color';

export default function BetCard({
  item,
  isCurrentUser,
}: {
  item: MatchBetListItem;
  isCurrentUser: boolean;
}) {
  const betStatusColor = useBetStatusColor(item.betStatus);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: betStatusColor,
        backgroundColor: '#13161a',
      }}
    >
      <Avatar.Image size={40} source={{ uri: item.avatarUrl }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {item.displayName}
          </Text>
          {isCurrentUser ? (
            <Text style={{ color: '#EA580C', fontSize: 12, fontWeight: '600' }}>
              You
            </Text>
          ) : null}
        </View>
        <Text variant="bodySmall" style={{ color: '#e4e4e7', marginTop: 4 }}>
          {item.homeScore} — {item.awayScore}
        </Text>
      </View>
    </View>
  );
}
