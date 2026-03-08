import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TamaguiProvider, View } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Platform, StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import config from '../tamagui.config';

export default function RootLayout() {
  const [queryClient] = useState(() => makeQueryClient());

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  // React Query focus handling for RN
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => sub.remove();
  }, []);

  // Assume online - expo-network useNetworkState can crash on iOS TestFlight
  useEffect(() => {
    onlineManager.setOnline(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme={'dark'} key={theme}>
        <PortalProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <Content />
            </QueryClientProvider>
          </SafeAreaProvider>
        </PortalProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}

function Content() {
  const insets = useSafeAreaInsets();

  return (
    <View
      backgroundColor={'$background'}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if ((error as any)?.status === 401) {
          router.replace('/(auth)/login');
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if ((error as any)?.status === 401) {
          router.replace('/(auth)/login');
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          // Don't retry auth errors
          if ((error as any)?.status === 401) {
            return false;
          }
          return failureCount < 2;
        },
        staleTime: 15_000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: Platform.OS === 'web',
      },
      mutations: {
        retry: false,
      },
    },
  });
}
