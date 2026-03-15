import { Avatar } from 'react-native-paper';
import { View } from 'react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useUserProfileQuery } from '../queries/user-profile.query';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

function useDisplayNameAndAvatar() {
  const { data: user } = useUserProfileQuery();
  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'Garage Bet';
  const initialsAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName,
  )}&background=EA580C&color=ffffff&bold=true`;

  return { user, initialsAvatarUrl };
}

export function HeaderAvatar() {
  const { user, initialsAvatarUrl } = useDisplayNameAndAvatar();

  return (
    <View style={{ marginLeft: 8 }}>
      <Avatar.Image
        size={40}
        source={{ uri: user?.avatarUrl || initialsAvatarUrl }}
      />
    </View>
  );
}

export function HeaderSettingsButton() {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      hitSlop={12}
      activeOpacity={0.6}
      onPress={() => router.push('/settings')}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
      }}
    >
      <MaterialCommunityIcons name="menu" size={24} color="#f1f5f9" />
    </TouchableOpacity>
  );
}

export default function Header() {
  const { user, initialsAvatarUrl } = useDisplayNameAndAvatar();
  const theme = useTheme();
  const appBackground = theme.colors.background;

  return (
    <View
      style={{
        backgroundColor: appBackground,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Avatar.Image
        size={40}
        source={{ uri: user?.avatarUrl || initialsAvatarUrl }}
      />

      <HeaderSettingsButton />
    </View>
  );
}
