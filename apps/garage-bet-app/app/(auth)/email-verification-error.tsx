import { router } from 'expo-router';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';

export default function EmailVerificationError() {
  return (
    <Screen
      style={{
        paddingTop: Dimensions.get('window').height * 0.2,
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Link expired
        </Text>
        <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
          Your email verification link has expired or is invalid. Please
          register again to get a new one.
        </Text>

        <Button
          mode="contained"
          onPress={() => router.replace('/(auth)/register')}
          style={{ backgroundColor: '#EA580C', marginTop: 8 }}
        >
          Back to register
        </Button>

        <View style={{ alignItems: 'center' }}>
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
            <Text style={{ color: '#a1a1aa' }}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
