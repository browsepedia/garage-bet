import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useAnonymousRegisterMutation } from '../../mutations/annonymous-register.mutation';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const [name, setName] = useState('');
  const deviceId = useDeviceId();

  const { mutateAsync: anonymousRegister } = useAnonymousRegisterMutation();
  const canSubmit = Boolean(name.trim()) && Boolean(deviceId);

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
          onChangeText={(text) => setName(text)}
        />

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            disabled={!canSubmit}
            onPress={() =>
              router.replace(
                `/(auth)/register-with-email?name=${encodeURIComponent(name.trim())}`,
              )
            }
            style={{ backgroundColor: '#EA580C' }}
          >
            Continue with email
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text>or</Text>
          </View>

          <Button
            disabled={!canSubmit}
            mode="outlined"
            onPress={() => anonymousRegister({ deviceId, name: name.trim() })}
          >
            Continue without email
          </Button>

          <Text
            variant="bodyMedium"
            style={{ color: '#a1a1aa', textAlign: 'center' }}
          >
            Without an email you will not receive email notifications and
            reminders.
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
