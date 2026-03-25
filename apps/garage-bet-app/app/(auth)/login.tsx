import { LoginFormModel, LoginSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useDeviceLoginMutation } from '../../mutations/device-login.mutation';
import { useLoginMutation } from '../../mutations/login.mutation';
import { useDeviceRegistrationStatusQuery } from '../../queries/device-registration-status.query';
import { ApiError } from '../../utils/http-client';

export default function Login() {
  const { mutateAsync: login, isPending: isLoading } = useLoginMutation();
  const { mutateAsync: deviceLogin, isPending: isDeviceLoggingIn } =
    useDeviceLoginMutation();

  const { data: deviceStatus, isSuccess } = useDeviceRegistrationStatusQuery();
  const hasDeviceOnlyOnDevice =
    isSuccess && deviceStatus?.registered === true;

  const [formError, setFormError] = useState<string | null>(null);
  const [deviceLoginError, setDeviceLoginError] = useState<string | null>(null);

  const onDeviceLogin = async () => {
    setDeviceLoginError(null);
    try {
      await deviceLogin();
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setDeviceLoginError(e.message);
      } else {
        setDeviceLoginError('Could not sign in with this device.');
      }
    }
  };

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

        {Object.keys(errors).length > 0 && (
          <View>
            {Object.keys(errors).map((key) => (
              <View
                key={key}
                style={{
                  padding: 8,
                  paddingHorizontal: 16,
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
              padding: 8,
              paddingHorizontal: 16,
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
            'Login with email'
          )}
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text>or</Text>
        </View>

        {deviceLoginError ? (
          <View
            style={{
              padding: 8,
              paddingHorizontal: 16,
              backgroundColor: '#7f1d1d',
            }}
          >
            <Text style={{ color: '#fca5a5' }}>{deviceLoginError}</Text>
          </View>
        ) : null}

        <Button
          mode="outlined"
          disabled={isDeviceLoggingIn}
          onPress={onDeviceLogin}
        >
          {isDeviceLoggingIn ? (
            <ActivityIndicator size="small" />
          ) : (
            'Login with device only'
          )}
        </Button>

        {hasDeviceOnlyOnDevice ? (
          <Text variant="bodySmall" style={{ color: '#a1a1aa', textAlign: 'center' }}>
            Signs in the device-only account for this phone. Email login above
            links this phone to that email account as well.
          </Text>
        ) : (
          <Text variant="bodySmall" style={{ color: '#a1a1aa', textAlign: 'center' }}>
            Device-only login works if you registered without email on this
            phone.
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text>or</Text>
        </View>

        <Button
          mode="outlined"
          onPress={() => router.replace('/(auth)/register')}
        >
          Register
        </Button>
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
