import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { UserProfileModel, UserProfileSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { Avatar, Dialog, Text, useTheme } from 'react-native-paper';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { ThemedInput } from '../components/ThemedInput';
import { useDeleteAccount } from '../mutations/delete-account.mutation';
import { useLogout } from '../mutations/logout.mutation';
import { useUserProfileQuery } from '../queries/user-profile.query';
import { AppTheme } from '../theme';

export default function Settings() {
  const { data: user } = useUserProfileQuery();
  const initialsAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name?.trim() || user?.email?.split('@')[0] || 'Garage Bet',
  )}&background=EA580C&color=ffffff&bold=true`;

  const theme = useTheme<AppTheme>();

  const { control, handleSubmit } = useForm<UserProfileModel>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      avatarUrl: user?.avatarUrl || undefined,
    },
  });

  const { mutateAsync: logout } = useLogout();
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    useDeleteAccount();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const onConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    await deleteAccount();
  };

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(app)');
  };

  const onSave = handleSubmit(async () => {
    return;
  });

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing(1),
        }}
      >
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
            marginLeft: theme.spacing(-2),
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#f1f5f9"
          />
        </TouchableOpacity>

        <Text variant="headlineSmall">Settings</Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          gap: theme.spacing(2),
          paddingTop: theme.spacing(4),
          flex: 1,
        }}
      >
        <Avatar.Image
          size={96}
          source={{ uri: user?.avatarUrl || initialsAvatarUrl }}
        />

        <View style={{ flex: 1, width: '100%', gap: theme.spacing(2) }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <ThemedInput
                value={value || ''}
                onChangeText={onChange}
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
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  placeholder="Email"
                />
              )}
            />
          )}

          <Button
            mode="contained"
            onPress={onSave}
            style={{ backgroundColor: '#EA580C' }}
          >
            Save
          </Button>
        </View>

        <Button
          mode="outlined"
          onPress={() => logout()}
          style={{ width: '100%', borderColor: '#ef4444' }}
          textColor="#ef4444"
        >
          Logout
        </Button>

        <Button
          mode="contained"
          onPress={() => setConfirmDeleteOpen(true)}
          loading={isDeleting}
          disabled={isDeleting}
          style={{ width: '100%', backgroundColor: '#ef4444' }}
          textColor="#ffffff"
        >
          Delete account
        </Button>
      </View>

      <Dialog
        visible={confirmDeleteOpen}
        onDismiss={() => setConfirmDeleteOpen(false)}
        style={{
          borderWidth: 1,
          borderColor: '#3f3f46',
        }}
      >
        <Dialog.Title>Delete account?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            This will permanently delete your account and all of your bets.
            This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions
          style={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Button
            mode="outlined"
            compact
            onPress={() => setConfirmDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            compact
            onPress={onConfirmDelete}
            loading={isDeleting}
            disabled={isDeleting}
            style={{ backgroundColor: '#ef4444' }}
            textColor="#ffffff"
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Screen>
  );
}
