import { Chrome } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { ChangeEvent, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useRegisterMutation } from '../../mutations/register.mutation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutateAsync: register, isPending: isLoading } = useRegisterMutation();

  return (
    <Screen
      style={{
        justifyContent: 'center',
      }}
    >
      <YStack gap={'$4'}>
        <Text fontSize={'$8'} fontWeight="bold">
          Register
        </Text>
        <ThemedInput
          placeholder="Name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        <ThemedInput
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <ThemedInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        <ThemedInput
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />

        <Button
          backgroundColor="$brand"
          size="$4"
          onPress={() => register({ email, password, name })}
        >
          <Text color="$brandForeground">Register</Text>
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
          <Text>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text>Login</Text>
          </TouchableOpacity>
        </YStack>
      </YStack>
    </Screen>
  );
}
