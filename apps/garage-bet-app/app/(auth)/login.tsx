import { LoginFormModel, LoginSchema } from '@garage-bet/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chrome } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useLoginMutation } from '../../mutations/login.mutation';

export default function Login() {
  const { mutateAsync: login, isPending: isLoading } = useLoginMutation();

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
      <YStack gap={'$4'}>
        <Text fontSize={'$8'} fontWeight="bold">
          Login
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <ThemedInput
              value={value}
              onChange={onChange}
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
              onChange={onChange}
              onBlur={onBlur}
              secureTextEntry
              placeholder="••••••••"
            />
          )}
        />

        {Object.keys(errors).length > 0 && (
          <YStack>
            {Object.keys(errors).map((key) => (
              <XStack
                padding={'$2'}
                paddingHorizontal={'$4'}
                key={key}
                backgroundColor="$red1"
              >
                <Text color="$red10">
                  {errors[key as keyof typeof errors]?.message}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        <Button backgroundColor="$brand" size="$4" onPress={handleLogin}>
          {isLoading ? (
            <Spinner size="small" color="$brandForeground" />
          ) : (
            <Text color="$brandForeground">Login</Text>
          )}
        </Button>

        <XStack justifyContent="center">
          <Text>or</Text>
        </XStack>

        <XStack justifyContent="center" gap={'$4'}>
          <Button flex={1} icon={Chrome} backgroundColor={'#EA4335'}>
            <Text>Google</Text>
          </Button>
        </XStack>

        <YStack alignItems="center" gap={'$4'}>
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
        </YStack>
      </YStack>
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
