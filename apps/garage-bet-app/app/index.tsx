import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { getAccessToken, getRefreshToken } from '../storage/token-storage';
import { tryDeviceOnlyAutoLogin } from '../utils/try-device-only-auto-login';

export default function Home() {
  useEffect(() => {
    let active = true;

    (async () => {
      const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!active) {
        return;
      }

      if (accessToken || refreshToken) {
        router.replace('/(app)/home');
        return;
      }

      const autoLoggedIn = await tryDeviceOnlyAutoLogin();
      if (!active) return;

      if (autoLoggedIn) {
        router.replace('/(app)/home');
        return;
      }

      router.replace('/(auth)/login');
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator />
      <Text style={{ marginTop: 12 }}>Checking session...</Text>
    </Screen>
  );
}
