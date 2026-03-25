import { DeviceRegisterSchema } from '@garage-bet/models';
import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useDeviceRegisterMutation } from '../../mutations/device-register.mutation';
import { ApiError } from '../../utils/http-client';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function RegisterWithDevice() {
  const { deviceId, isDeviceIdReady } = useDeviceId();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { mutateAsync: registerDevice, isPending } =
    useDeviceRegisterMutation();

  const onRegister = async () => {
    setFormError(null);

    const parsed = DeviceRegisterSchema.safeParse({
      name: name.trim(),
      deviceId,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setFormError(first?.message ?? 'Invalid input');
      return;
    }

    try {
      await registerDevice(parsed.data);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError(
          'Registration failed. Try again or use a different email.',
        );
      }
    }
  };

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

        <ThemedInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />

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

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            disabled={isPending || !isDeviceIdReady || !deviceId}
            onPress={onRegister}
            style={{ backgroundColor: '#EA580C' }}
          >
            Register
          </Button>
        </View>

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
