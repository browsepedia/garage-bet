import { UserProfileModel, UserProfileSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar } from '@tamagui/avatar';
import { Button } from '@tamagui/button';
import { View } from '@tamagui/core';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { XStack, YStack } from '@tamagui/stacks';
import { H5 } from '@tamagui/text';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { ThemedInput } from '../components/ThemedInput';
import { useLogout } from '../mutations/logout.mutation';
import { useUserProfileQuery } from '../queries/user-profile.query';

export default function Settings() {
  const { data: user } = useUserProfileQuery();
  const initialsAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name?.trim() || user?.email?.split('@')[0] || 'Garage Bet',
  )}&background=EA580C&color=ffffff&bold=true`;

  const { control, handleSubmit } = useForm<UserProfileModel>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      avatarUrl: user?.avatarUrl || undefined,
    },
  });

  const { mutateAsync: logout } = useLogout();

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(app)/home');
  };

  const onSave = handleSubmit(async () => {
    return;
  });

  return (
    <Screen>
      <XStack alignItems="center">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          activeOpacity={0.6}
          hitSlop={12}
          onPress={onBackPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -16,
          }}
        >
          <ChevronLeft />
        </TouchableOpacity>

        <H5>Settings</H5>
      </XStack>

      <YStack alignItems="center" gap={'$4'} paddingTop={'$8'} flex={1}>
        <Avatar circular size="$12">
          <Avatar.Image src={user?.avatarUrl || initialsAvatarUrl} />
          <Avatar.Fallback backgroundColor="$brand" />
        </Avatar>

        <View flex={1} width={'100%'} gap={'$4'}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <ThemedInput
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Name"
              />
            )}
          />

          {user?.email && (
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <ThemedInput
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  placeholder="Email"
                />
              )}
            />
          )}

          <Button size="$3" backgroundColor="$brand" onPress={onSave}>
            Save
          </Button>
        </View>

        <Button
          size="$3"
          backgroundColor="$red5"
          width={'100%'}
          variant="outlined"
          onPress={() => logout()}
        >
          Logout
        </Button>
      </YStack>
    </Screen>
  );
}
