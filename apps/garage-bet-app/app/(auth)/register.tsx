import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useDeviceRegistrationStatusQuery } from '../../queries/device-registration-status.query';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const { deviceId } = useDeviceId();

  const { data: deviceStatus, isSuccess } = useDeviceRegistrationStatusQuery();

  const hasDeviceOnlyOnDevice =
    isSuccess && deviceStatus?.registered === true;

  const canSubmit = Boolean(deviceId);

  return (
    <Screen
      style={{
        justifyContent: 'center',
      }}
    >
      <View style={{ gap: 16 }}>
        <Text
          variant="headlineLarge"
          style={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          Register
        </Text>

        {hasDeviceOnlyOnDevice ? (
          <Text
            variant="bodyMedium"
            style={{ color: '#a1a1aa', textAlign: 'center' }}
          >
            This phone already has its device-only account. Email sign-up below
            creates a separate account (the device-only profile stays). Use Login
            to pick device-only or email.
          </Text>
        ) : null}

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            disabled={!canSubmit}
            onPress={() => router.replace('/(auth)/register-with-email')}
            style={{ backgroundColor: '#EA580C' }}
          >
            Continue with email
          </Button>

          {!hasDeviceOnlyOnDevice ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text>or</Text>
              </View>

              <Button
                disabled={!canSubmit}
                mode="contained"
                onPress={() => router.replace('/(auth)/register-with-device')}
                style={{ backgroundColor: '#EA580C' }}
              >
                Continue with device only
              </Button>

              <Text
                variant="bodyMedium"
                style={{ color: '#a1a1aa', textAlign: 'center' }}
              >
                One device-only account per phone. You can also register with
                email later for a separate account on the same phone. Without
                email you will not receive email notifications.
              </Text>
            </>
          ) : null}
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
