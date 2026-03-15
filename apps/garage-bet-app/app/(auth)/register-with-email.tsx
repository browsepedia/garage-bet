import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { ThemedInput } from '../../components/ThemedInput';
import { useRegisterMutation } from '../../mutations/register.mutation';
import { useDeviceId } from '../../utils/use-device-id.hook';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { name } = useLocalSearchParams();

  const { mutateAsync: register } = useRegisterMutation();
  const deviceId = useDeviceId();

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
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <ThemedInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <ThemedInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={{ justifyContent: 'center', gap: 16 }}>
          <Button
            mode="contained"
            onPress={() =>
              register({ email, password, name: name as string, deviceId })
            }
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
