import { MatchBetListItem } from '@garage-bet/models';
import { Image, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';
import { useBetStatusColor } from '../utils/use-bet-status-color';

export default function BetCard({
  item,
  isCurrentUser,
}: {
  item: MatchBetListItem;
  isCurrentUser: boolean;
}) {
  const betStatusColor = useBetStatusColor(item.betStatus);
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing(1),
        paddingVertical: theme.spacing(1),
        paddingHorizontal: theme.spacing(1),
        marginBottom: 8,
        borderRadius: theme.roundness,
        borderWidth: 1,
        borderColor: betStatusColor,
        backgroundColor: '#13161a',
      }}
    >
      <Image
        source={{ uri: item.avatarUrl }}
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />
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
