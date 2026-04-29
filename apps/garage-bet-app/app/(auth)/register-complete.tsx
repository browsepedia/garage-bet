import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';

export default function RegisterComplete() {
  return (
    <Screen
      style={{
        justifyContent: 'center',
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Register Complete
        </Text>

        <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
          Your account has been created successfully. Please check your email
          for a verification link to continue.
        </Text>

        <View style={{ alignItems: 'center', gap: 16 }}>
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
