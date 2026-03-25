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

export default function Login() {
  const [deviceLoginError, setDeviceLoginError] = useState<string | null>(null);
  const { mutateAsync: login, isPending: isLoading } = useLoginMutation();
  const { mutateAsync: deviceLogin, isPending: isDeviceLoginLoading } =
    useDeviceLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  const handleLogin = handleSubmit(async (data: LoginFormModel) => {
    try {
      await login(data);
    } catch (error) {
      console.error(error);
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
          mode="contained"
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
