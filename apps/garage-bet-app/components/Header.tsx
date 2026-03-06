import { Menu as MenuIcon } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Avatar, View } from 'tamagui';
import { useUserProfileQuery } from '../queries/user-profile.query';

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
    <View marginLeft="$2">
      <Avatar circular size="$5">
        <Avatar.Image src={user?.avatarUrl || initialsAvatarUrl} />
        <Avatar.Fallback backgroundColor="$red1" />
      </Avatar>
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
      <MenuIcon />
    </TouchableOpacity>
  );
}

export default function Header() {
  const { user, initialsAvatarUrl } = useDisplayNameAndAvatar();

  return (
    <View
      backgroundColor="$background"
      paddingBottom={'$4'}
      paddingHorizontal={'$4'}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Avatar circular size="$5">
        <Avatar.Image src={user?.avatarUrl || initialsAvatarUrl} />
        <Avatar.Fallback backgroundColor="$red1" />
      </Avatar>

      <HeaderSettingsButton />
    </View>
  );
}
