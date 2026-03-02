import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text } from 'tamagui';
import { Screen } from '../components/Screen';
import { getAccessToken, getRefreshToken } from '../storage/token-storage';

export default function Home() {
  useEffect(() => {
    let active = true;

    (async () => {
      const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!active) return;

      if (accessToken || refreshToken) {
        router.replace('/(app)/home');
        return;
      }

      router.replace('/(auth)/login');
    })();

    return () => {
      active = false;
    };
  }, []);

  console.log('Home');

  return (
    <Screen
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator />
      <Text marginTop="$3">Checking session...</Text>
    </Screen>
  );
}
