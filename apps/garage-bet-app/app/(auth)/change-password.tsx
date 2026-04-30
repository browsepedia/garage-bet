import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useResetPasswordMutation } from '../../mutations/reset-password.mutation';
import { ApiError } from '../../utils/http-client';

export default function ChangePassword() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const theme = useTheme();
  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();

  const canSubmit =
    Boolean(password.trim()) && Boolean(confirmPassword.trim()) && !isPending;

  const onSubmit = async () => {
    setFormError(null);

    if (!token) {
      setFormError('Invalid reset link. Please request a new one.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, newPassword: password });
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Screen
      style={{
        paddingTop: Dimensions.get('window').height * 0.2,
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          New password
        </Text>
        <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
          Choose a new password for your account.
        </Text>

        <ThemedInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="New password"
        />

        <ThemedInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Confirm new password"
        />

        {formError ? (
          <View
            style={{
              padding: 8,
              paddingHorizontal: 16,
              backgroundColor: theme.colors.errorContainer,
            }}
          >
            <Text style={{ color: theme.colors.onErrorContainer }}>
              {formError}
            </Text>
          </View>
        ) : null}

        <Button
          mode="contained"
          disabled={!canSubmit}
          onPress={onSubmit}
          style={{ backgroundColor: '#EA580C' }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            'Set new password'
          )}
        </Button>
      </View>
    </Screen>
  );
}
