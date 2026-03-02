import { Play, Trophy, Volleyball } from '@tamagui/lucide-icons';
import { useQuery } from '@tanstack/react-query';
import { Redirect, Tabs, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import Header from '../../components/Header';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../../storage/token-storage';
import { ApiError, apiJson } from '../../utils/http-client';

type MeDto = { id: string; email: string };

async function hasAnyToken() {
  const [a, r] = await Promise.all([getAccessToken(), getRefreshToken()]);
  return Boolean(a || r);
}

export default function AppLayout() {
  const segments = useSegments(); // optional, useful if you later do smarter routing
  const [bootstrapped, setBootstrapped] = useState(false);
  const [tokenHint, setTokenHint] = useState(false);

  // 1) Quick local check first (prevents calling /me if user has no tokens at all)

  useEffect(() => {
    (async () => {
      const ok = await hasAnyToken();
      setTokenHint(ok);
      setBootstrapped(true);
    })();
  }, [segments]);

  // 2) If we have tokens, confirm session by calling /me (this will auto-refresh via apiFetch)
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => apiJson<MeDto>('/me'),
    enabled: bootstrapped && tokenHint,
  });

  console.log(
    'AppLayout',
    bootstrapped,
    tokenHint,
    meQuery.isPending,
    meQuery.isError,
  );

  // While bootstrapping or checking /me
  if (!bootstrapped || (tokenHint && meQuery.isLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  console.log('TEST');

  // No tokens at all → go login
  if (!tokenHint) {
    return <Redirect href="/(auth)/login" />;
  }

  // Tokens exist but /me failed with 401 (refresh failed or revoked) → go login
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
          backgroundColor: '#0A0F1C',
        }}
      >
        <YStack gap="$3" alignItems="center" maxWidth={320}>
          <Text fontSize="$6" fontWeight="700">
            Could not load session
          </Text>
          <Text textAlign="center" opacity={0.8}>
            {message}
          </Text>
          <Button onPress={() => meQuery.refetch()}>Try again</Button>
          <Button
            chromeless
            onPress={async () => {
              await clearTokens();
              router.replace('/(auth)/login');
            }}
          >
            Go to login
          </Button>
        </YStack>
      </View>
    );
  }

  // Auth OK
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <Header />,

        tabBarStyle: {
          backgroundColor: '#0A0F1C',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          marginBottom: 0,
        },
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
          tabBarIcon: ({ color, size }) => <Play color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Volleyball color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
