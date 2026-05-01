import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { AppTheme } from '../../theme';

export default function EmailVerified() {
  const theme = useTheme<AppTheme>();

  return (
    <Screen
      style={{
        justifyContent: 'center',
      }}
    >
      <View style={{ gap: theme.spacing(2) }}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>
          Email Verified
        </Text>

        <Text variant="bodyMedium" style={{ color: '#a1a1aa' }}>
          Your email has been verified successfully. Please login to continue.
        </Text>

        <View style={{ alignItems: 'center', gap: theme.spacing(2) }}>
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
