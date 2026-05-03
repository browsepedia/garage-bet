import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** Default Android channel id (must match server payloads if targeting a channel). */
export const ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';

/**
 * How notifications are shown while the app is in the foreground.
 * Call once at startup (imported from index.js).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Opens `/matches/[matchId]` when the user taps a notification that carries
 * `data.matchId`. Mount once in the authenticated layout.
 *
 * Cold start: `getLastNotificationResponse()` (sync); while running: listener.
 */
export function usePushNotificationDeepLink(): void {
  const router = useRouter();
  const handledIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function openMatchFromNotification(
      notification: Notifications.Notification,
    ) {
      const matchId = (
        notification.request.content.data as { matchId?: unknown } | undefined
      )?.matchId;
      if (typeof matchId !== 'string' || matchId.trim().length === 0) {
        return;
      }

      const id = notification.request.identifier;
      if (handledIdsRef.current.has(id)) {
        return;
      }
      handledIdsRef.current.add(id);

      Notifications.clearLastNotificationResponse();

      const href = `/matches/${matchId.trim()}`;
      const go = () => router.push(href);
      // Android: defer one tick so the root navigator is ready (Expo Router quirk).
      if (Platform.OS === 'android') {
        setTimeout(go, 1);
      } else go();
    }

    const initialResponse = Notifications.getLastNotificationResponse();
    if (
      initialResponse &&
      initialResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      openMatchFromNotification(initialResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (
          response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
        )
          return;
        openMatchFromNotification(response.notification);
      },
    );

    return () => subscription.remove();
  }, [router]);
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(
    ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID,
    {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EA580C',
    },
  );
}

/**
 * Requests permission (if needed) and returns the Expo push token, or null on
 * simulator / denied / web / missing EAS project id.
 */
export async function getExpoPushTokenOrNull(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  // if (!Device.isDevice) {
  //   if (__DEV__) {
  //     console.info('[push] Skipping push token: not a physical device');
  //   }
  //   return null;
  // }

  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    if (__DEV__) {
      console.info('[push] Notification permission not granted');
    }
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    if (__DEV__) {
      console.warn(
        '[push] Missing extra.eas.projectId — add it in app.json for push tokens in dev builds',
      );
    }
    return null;
  }

  try {
    const push = await Notifications.getExpoPushTokenAsync({ projectId });
    return push.data ?? null;
  } catch (e) {
    console.warn('[push] getExpoPushTokenAsync failed', e);
    return null;
  }
}
