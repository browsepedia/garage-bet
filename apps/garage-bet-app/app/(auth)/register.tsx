import { Chrome } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useRegisterMutation } from '../../mutations/register.mutation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { mutateAsync: register, isPending: isLoading } = useRegisterMutation();

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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setFormError(null);
    await register({ email, password, name });
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
          placeholder="Name"
          value={name}
          onChange={(event) => setName(getInputValue(event))}
        />
        <ThemedInput
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(getInputValue(event))}
        />
        <ThemedInput
          secureTextEntry
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(getInputValue(event))}
        />
        <ThemedInput
          secureTextEntry
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(getInputValue(event))}
        />

        {formError ? (
          <XStack padding="$2" paddingHorizontal="$4" backgroundColor="$red1">
            <Text color="$red10">{formError}</Text>
          </XStack>
        ) : null}

        <Button
          backgroundColor="$brand"
          size="$4"
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner size="small" color="$brandForeground" />
          ) : (
            <Text color="$brandForeground">Register</Text>
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
