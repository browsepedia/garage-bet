import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { getAccessToken, getRefreshToken } from '../storage/token-storage';
import { AppTheme } from '../theme';

export default function Home() {
  const theme = useTheme<AppTheme>();

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
        router.replace('/(app)/today');
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
      <ActivityIndicator size="large" color="#EA580C" />
      <Text style={{ marginTop: theme.spacing(1) }}>Checking session...</Text>
    </Screen>
  );
}
