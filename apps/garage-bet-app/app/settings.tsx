import { UserProfileModel, UserProfileSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Avatar, Button, H5, View, XStack, YStack } from 'tamagui';
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

  return (
    <Screen>
      <XStack alignItems="center">
        <Button
          aria-label="Back"
          size="$3"
          backgroundColor="transparent"
          onPress={() => router.back()}
        >
          <ChevronLeft />
        </Button>

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

          <Button
            size="$3"
            backgroundColor="$brand"
            onPress={handleSubmit(() => {})}
          >
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
