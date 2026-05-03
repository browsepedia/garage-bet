import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { router, Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AppState, Platform, StatusBar, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { hasStoredTokens } from '../storage/token-storage';
import { darkTheme } from '../theme';
import { apiJson } from '../utils/http-client';

/** Paths handled by `app/(auth)/*` — do not force login when session is empty. */
const AUTH_PATH_PREFIXES = [
  '/login',
  '/register',
  '/register-complete',
  '/email-verified',
  '/change-password',
  '/email-not-verified',
  '/email-verification-error',
  '/password-reset-error',
  '/forgot-password',
];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

type MeDto = { id: string; email: string };

let rootSplashHidden = false;

async function hideRootSplashOnce() {
  if (rootSplashHidden) {
    return;
  }
  rootSplashHidden = true;
  await SplashScreen.hideAsync();
}

export default function RootLayout() {
  const [queryClient] = useState(() => makeQueryClient());

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
      <PaperProvider theme={darkTheme}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <Content />
          </QueryClientProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

function Content() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Session + optional navigation while native splash stays up (index.js: preventAutoHideAsync).
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const ok = await hasStoredTokens();
        if (cancelled) {
          return;
        }

        const path = pathname ?? '';
        const atRoot = path === '/' || path === '';

        if (ok) {
          await queryClient
            .prefetchQuery({
              queryKey: ['me'],
              queryFn: () => apiJson<MeDto>('/me'),
            })
            .catch(() => undefined);
          if (cancelled) {
            return;
          }
          // Default stack entry is `(app)` — only normalize legacy `/` opens.
          if (atRoot) {
            router.replace('/(app)');
          }
        } else if (atRoot || !isAuthPath(path)) {
          router.replace('/(auth)/login');
        }
      } finally {
        if (!cancelled) {
          await hideRootSplashOnce();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot bootstrap; pathname from first paint only
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: '#111418',
      }}
    >
      <StatusBar barStyle="light-content" />
      <Stack
        initialRouteName="(app)"
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/register-complete"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/email-verified"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/change-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/email-not-verified"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/email-verification-error"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/password-reset-error"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="compare/[userId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="my-stats" options={{ headerShown: false }} />
        <Stack.Screen
          name="player-stats/[userId]"
          options={{ headerShown: false }}
        />
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
