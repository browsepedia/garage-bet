import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useRegisterMutation } from '../../mutations/register.mutation';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { name } = useLocalSearchParams();

  const { mutateAsync: register, isPending: isLoading } = useRegisterMutation();
  const deviceId = useDeviceId();

  const getInputValue = (event: unknown) => {
    if (typeof event === 'string') {
      return event;
    }

    const nativeText = (event as { nativeEvent?: { text?: string } })
      ?.nativeEvent?.text;
    if (typeof nativeText === 'string') {
      return nativeText;
    }

    const targetValue = (event as { target?: { value?: string } })?.target
      ?.value;
    if (typeof targetValue === 'string') {
      return targetValue;
    }

    return '';
  };

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
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(getInputValue(event))}
        />

        <ThemedInput
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(getInputValue(event))}
        />

        <ThemedInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(getInputValue(event))}
        />

        <YStack justifyContent="center" gap={'$4'}>
          <Button
            backgroundColor="$brand"
            size="$4"
            onPress={() =>
              register({ email, password, name: name as string, deviceId })
            }
          >
            Register
          </Button>
        </YStack>

        <YStack alignItems="center" gap={'$4'}>
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
        </YStack>
      </YStack>
    </Screen>
  );
}
