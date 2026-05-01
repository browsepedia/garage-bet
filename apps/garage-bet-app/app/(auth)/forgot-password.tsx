import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useForgotPasswordMutation } from '../../mutations/forgot-password.mutation';
import { AppTheme } from '../../theme';
import { ApiError } from '../../utils/http-client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const theme = useTheme<AppTheme>();
  const { mutateAsync: forgotPassword, isPending } =
    useForgotPasswordMutation();

  const canSubmit = Boolean(email.trim()) && !isPending;

  const onSubmit = async () => {
    setFormError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setFormError('Email is required');
      return;
    }

    try {
      await forgotPassword(trimmed);
      setSubmitted(true);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  if (submitted) {
    return (
      <Screen
        style={{
          paddingTop: Dimensions.get('window').height * 0.2,
        }}
      >
        <View style={{ gap: 16 }}>
          <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
            Check your email
          </Text>
          <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
            If {email.trim()} is registered, we've sent a password reset link.
            Check your email and tap the link to choose a new password.
          </Text>

          <Button
            mode="contained"
            onPress={() => router.replace('/(auth)/login')}
            style={{ backgroundColor: '#EA580C', marginTop: 8 }}
          >
            Back to login
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      style={{
        paddingTop: Dimensions.get('window').height * 0.2,
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Forgot password
        </Text>
        <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        <ThemedInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
        />

        {formError ? (
          <View
            style={{
              padding: theme.spacing(1),
              paddingHorizontal: theme.spacing(2),
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
            'Send reset link'
          )}
        </Button>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={12}
            onPress={() => router.replace('/(auth)/login')}
            style={{
              minHeight: 44,
              minWidth: 80,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#a1a1aa' }}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
