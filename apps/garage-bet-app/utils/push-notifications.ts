import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
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

  if (!Device.isDevice) {
    if (__DEV__) {
      console.info('[push] Skipping push token: not a physical device');
    }
    return null;
  }

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
