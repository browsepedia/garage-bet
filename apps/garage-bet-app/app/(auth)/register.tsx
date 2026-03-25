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

  const deviceAlreadyRegistered =
    isSuccess && deviceStatus?.registered === true;

  const canSubmit = Boolean(deviceId);

  const showDeviceOnlyPath = canSubmit && !deviceAlreadyRegistered;

  console.log('deviceAlreadyRegistered', deviceAlreadyRegistered, isSuccess);

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

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            disabled={!canSubmit}
            onPress={() => router.replace('/(auth)/register-with-email')}
            style={{ backgroundColor: '#EA580C' }}
          >
            Continue with email
          </Button>

          {showDeviceOnlyPath ? (
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
                Device-only accounts are tied to this phone. Without an email
                you will not receive email notifications and reminders.
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
