import { Chrome, Facebook } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { ChangeEvent, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
          onPress={async () => {
            try {
              const res = await fetch(
                'http://10.0.2.2:3000/api/auth/register',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    email: email,
                    password: password,
                    name: name,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              console.log('res', await res.json());
              if (!res.ok) {
                throw new Error('Failed to register');
              }
              console.log('Registration successful');
              const data = await res.json();
              console.log(data);
            } catch (err) {
              console.error('Register API call failed:', err);
            }
          }}
        >
          <Text color="$brandForeground">Register</Text>
        </Button>

        <XStack justifyContent="center">
          <Text>or</Text>
        </XStack>

        <XStack justifyContent="center" gap={'$4'}>
          <Button flex={1} icon={Facebook} backgroundColor={'#1877F2'}>
            <Text>Facebook</Text>
          </Button>
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
