import { RegisterFormModel, RegisterFormSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useRegisterMutation } from '../../mutations/register.mutation';
import { AppTheme } from '../../theme';
import { ApiError } from '../../utils/http-client';

export default function Register() {
  const [formError, setFormError] = useState<string | null>(null);
  const theme = useTheme<AppTheme>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useRegisterForm();

  const handleRegister = handleSubmit(async (data: RegisterFormModel) => {
    setFormError(null);
    try {
      await register(data);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Registration failed. Try again.');
      }
    }
  });

  const { mutateAsync: register, isPending } = useRegisterMutation();

  return (
    <Screen
      style={{
        justifyContent: 'center',
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Register
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              placeholder="Display Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              placeholder="Confirm Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
            />
          )}
        />

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
          onPress={handleRegister}
          backgroundColor="#EA580C"
          color="#ffffff"
          loading={isPending}
        >
          Register
        </Button>

        <View style={{ alignItems: 'center', gap: 16 }}>
          <Text>Already have an account?</Text>

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
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const useRegisterForm = () =>
  useForm<RegisterFormModel>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    mode: 'onSubmit',
  });
