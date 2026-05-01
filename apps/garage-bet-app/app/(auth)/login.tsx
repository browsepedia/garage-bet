import { LoginFormModel, LoginSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useLoginMutation } from '../../mutations/login.mutation';
import { AppTheme } from '../../theme';
import { ApiError } from '../../utils/http-client';

export default function Login() {
  const { mutateAsync: login, isPending: isLoading } = useLoginMutation();
  const theme = useTheme<AppTheme>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  const handleLogin = handleSubmit(async (data: LoginFormModel) => {
    setFormError(null);
    try {
      await login(data);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.status === 403) {
          router.replace('/(auth)/email-not-verified');
          return;
        }
        setFormError(e.message);
      } else {
        setFormError('Sign in failed. Try again.');
      }
    }
  });

  return (
    <Screen
      style={{
        paddingTop: Dimensions.get('window').height * 0.2,
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Login
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@email.com"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
            />
          )}
        />

        <Pressable
          onPress={() => router.replace('/(auth)/forgot-password')}
          style={{ alignSelf: 'flex-end' }}
        >
          <Text variant="bodySmall" style={{ color: '#EA580C' }}>
            Forgot password?
          </Text>
        </Pressable>

        {Object.keys(errors).length > 0 && (
          <View>
            {Object.keys(errors).map((key) => (
              <View
                key={key}
                style={{
                  padding: theme.spacing(1),
                  paddingHorizontal: theme.spacing(2),
                  backgroundColor: '#7f1d1d',
                }}
              >
                <Text style={{ color: '#fca5a5' }}>
                  {errors[key as keyof typeof errors]?.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {formError ? (
          <View
            style={{
              padding: theme.spacing(1),
              paddingHorizontal: theme.spacing(2),
              backgroundColor: '#7f1d1d',
            }}
          >
            <Text style={{ color: '#fca5a5' }}>{formError}</Text>
          </View>
        ) : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={{ backgroundColor: '#EA580C' }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            'Login'
          )}
        </Button>

        <View
          style={{
            alignItems: 'center',
            gap: theme.spacing(2),
            marginTop: theme.spacing(1),
          }}
        >
          <Text>Don't have an account?</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={12}
            onPress={() => router.replace('/(auth)/register')}
            style={{
              minHeight: 44,
              minWidth: 80,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const useLoginForm = () =>
  useForm<LoginFormModel>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });
