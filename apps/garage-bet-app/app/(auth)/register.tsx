import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useAnonymousRegisterMutation } from '../../mutations/annonymous-register.mutation';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const [name, setName] = useState('');
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

  const { mutateAsync: anonymousRegister, isPending: isLoading } =
    useAnonymousRegisterMutation();

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
          onChange={(event) => setName(getInputValue(event))}
        />

        <YStack justifyContent="center" gap={'$4'}>
          <Button
            backgroundColor="$brand"
            size="$4"
            onPress={() =>
              router.replace(`/(auth)/register-with-email?name=${name}`)
            }
          >
            Continue with email
          </Button>

          <Button
            size="$4"
            variant="outlined"
            onPress={() => anonymousRegister({ deviceId, name })}
          >
            Continue without email
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
