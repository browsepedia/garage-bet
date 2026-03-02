import { Menu as MenuIcon } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { TouchableHighlight } from 'react-native';
import { Avatar, View } from 'tamagui';
import { useUserProfileQuery } from '../queries/user-profile.query';

export default function Header() {
  const { data: user } = useUserProfileQuery();
  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'Garage Bet';
  const initialsAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName,
  )}&background=EA580C&color=ffffff&bold=true`;

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

      <TouchableHighlight onPress={() => router.push('/settings')}>
        <MenuIcon />
      </TouchableHighlight>
    </View>
  );
}
