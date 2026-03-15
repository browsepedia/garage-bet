import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { router } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
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

  const { mutateAsync: anonymousRegister } = useAnonymousRegisterMutation();

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
            onPress={() =>
              router.replace(`/(auth)/register-with-email?name=${name}`)
            }
            style={{ backgroundColor: '#EA580C' }}
          >
            Continue with email
          </Button>

          <Button
            mode="outlined"
            onPress={() => anonymousRegister({ deviceId, name })}
          >
            Continue without email
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
