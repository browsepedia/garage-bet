import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useDeviceRegisterMutation } from '../../mutations/device-register.mutation';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const deviceId = useDeviceId();

  const { mutateAsync: registerDevice, isPending: isDeviceRegistering } =
    useDeviceRegisterMutation();
  const canSubmit = Boolean(deviceId);

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

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            disabled={!canSubmit}
            onPress={() => router.replace('/(auth)/register-with-email')}
            style={{ backgroundColor: '#EA580C' }}
          >
            Continue with email
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text>or</Text>
          </View>

          {deviceError ? (
            <View
              style={{
                padding: 8,
                paddingHorizontal: 16,
                backgroundColor: '#7f1d1d',
              }}
            >
              <Text style={{ color: '#fca5a5' }}>{deviceError}</Text>
            </View>
          ) : null}

          <Button
            disabled={!canSubmit || isDeviceRegistering}
            mode="outlined"
            onPress={async () => {
              if (!deviceId) return;
              setDeviceError(null);
              try {
                await registerDevice({ deviceId });
              } catch (e: unknown) {
                const msg =
                  e instanceof Error ? e.message : 'Registration failed.';
                setDeviceError(msg);
              }
            }}
          >
            Continue with device only
          </Button>

          <Text
            variant="bodyMedium"
            style={{ color: '#a1a1aa', textAlign: 'center' }}
          >
            Device-only accounts are tied to this phone. Without an email you
            will not receive email notifications and reminders.
          </Text>
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
