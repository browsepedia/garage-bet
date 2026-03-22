import { Text } from 'react-native-paper';
import { Button } from '../../components/Button';
import { useQuery } from '@tanstack/react-query';
import { Redirect, router, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ExpoPushTokenSync } from '../../components/ExpoPushTokenSync';
import Header from '../../components/Header';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../../storage/token-storage';
import { ApiError, apiJson } from '../../utils/http-client';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type MeDto = { id: string; email: string };

async function hasAnyToken() {
  const [a, r] = await Promise.all([getAccessToken(), getRefreshToken()]);
  return Boolean(a || r);
}

export default function AppLayout() {
  const segments = useSegments();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [tokenHint, setTokenHint] = useState(false);
  const theme = useTheme();
  const appBackground = theme.colors.background;

  useEffect(() => {
    (async () => {
      const ok = await hasAnyToken();
      setTokenHint(ok);
      setBootstrapped(true);
    })();
  }, [segments]);

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => apiJson<MeDto>('/me'),
    enabled: bootstrapped && tokenHint,
  });

  if (!bootstrapped || (tokenHint && meQuery.isLoading)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: appBackground,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!tokenHint) {
    return <Redirect href="/(auth)/login" />;
  }

  if (meQuery.isError) {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      return <Redirect href="/(auth)/login" />;
    }

    const message =
      meQuery.error instanceof Error
        ? meQuery.error.message
        : 'Unexpected error while loading your profile.';

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backgroundColor: appBackground,
        }}
      >
        <View style={{ alignItems: 'center', maxWidth: 320, gap: 12 }}>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Could not load session
          </Text>
          <Text style={{ textAlign: 'center', opacity: 0.8 }}>{message}</Text>
          <Button onPress={() => meQuery.refetch()}>Try again</Button>
          <Button
            mode="text"
            onPress={async () => {
              await clearTokens();
              router.replace('/(auth)/login');
            }}
          >
            Go to login
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <ExpoPushTokenSync enabled={Boolean(meQuery.data?.id)} />
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: appBackground,
        },
        header: () => <Header />,
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: appBackground,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: appBackground,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          marginBottom: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: appBackground }} />
        ),
        tabBarActiveTintColor: '#EA580C',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Live',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="play" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="volleyball" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="final-bet"
        options={{
          title: 'Final',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flag-checkered" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}
