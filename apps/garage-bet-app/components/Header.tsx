import { router } from 'expo-router';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Avatar, IconButton, useTheme } from 'react-native-paper';
import { useUserProfileQuery } from '../queries/user-profile.query';
import { AppTheme } from '../theme';

function useDisplayNameAndAvatar() {
  const { data: user } = useUserProfileQuery();
  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'Garage Bet';
  const initialsAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName,
  )}&background=EA580C&color=ffffff&bold=true`;

  return { user, initialsAvatarUrl };
}

function openSettings() {
  router.push('/settings');
}

function ProfileAvatarButton({ style }: { style?: ViewStyle }) {
  const { user, initialsAvatarUrl } = useDisplayNameAndAvatar();

  return (
    <View style={style}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        hitSlop={12}
        activeOpacity={0.6}
        onPress={openSettings}
      >
        <Avatar.Image
          size={40}
          source={{ uri: user?.avatarUrl || initialsAvatarUrl }}
        />
      </TouchableOpacity>
    </View>
  );
}

export function HeaderAvatar() {
  return <ProfileAvatarButton style={{ marginLeft: 8 }} />;
}

export default function Header() {
  const theme = useTheme<AppTheme>();
  const appBackground = theme.colors.background;

  return (
    <View
      style={{
        backgroundColor: appBackground,
        paddingBottom: theme.spacing(2),
        paddingHorizontal: theme.spacing(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <ProfileAvatarButton />

      <IconButton
        icon="chart-box-outline"
        iconColor={theme.colors.onPrimary}
        style={{ backgroundColor: theme.colors.primary }}
        size={24}
        onPress={() => router.push('/my-stats')}
      />
    </View>
  );
}
