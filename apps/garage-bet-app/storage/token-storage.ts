import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'garage-bet-access-token';
const REFRESH_KEY = 'garage-bet-refresh-token';
const DEVICE_KEY = 'garage-bet-device-key';
/** Last `{deviceId}:{expoPushToken}` successfully sent to the API (avoids duplicate POSTs). */
const PUSH_TOKEN_SYNC_KEY = 'garage-bet-push-token-sync';
const KEYCHAIN_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'com.browsepedia.garagebet',
};

export async function getAccessToken() {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY, KEYCHAIN_OPTIONS);
  } catch {
    return null;
  }
}
export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY, KEYCHAIN_OPTIONS);
  } catch {
    return null;
  }
}
export async function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  await SecureStore.setItemAsync(
    ACCESS_KEY,
    tokens.accessToken,
    KEYCHAIN_OPTIONS,
  );
  await SecureStore.setItemAsync(
    REFRESH_KEY,
    tokens.refreshToken,
    KEYCHAIN_OPTIONS,
  );
}
export async function clearTokens() {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_KEY, KEYCHAIN_OPTIONS),
    SecureStore.deleteItemAsync(REFRESH_KEY, KEYCHAIN_OPTIONS),
    SecureStore.deleteItemAsync(PUSH_TOKEN_SYNC_KEY, KEYCHAIN_OPTIONS),
  ]);
}

export async function getLastSyncedExpoPushSignature() {
  try {
    return await SecureStore.getItemAsync(
      PUSH_TOKEN_SYNC_KEY,
      KEYCHAIN_OPTIONS,
    );
  } catch {
    return null;
  }
}

export async function setLastSyncedExpoPushSignature(signature: string) {
  try {
    await SecureStore.setItemAsync(
      PUSH_TOKEN_SYNC_KEY,
      signature,
      KEYCHAIN_OPTIONS,
    );
  } catch {
    // ignore
  }
}

type ApplicationLike = {
  androidId?: string | null;
  iosIdForVendor?: string | null;
  getAndroidId?: () => string | null;
  getIosIdForVendorAsync?: () => Promise<string | null>;
};

const EXPO_APPLICATION_IMPORT_MS = 5000;

async function importExpoApplicationOrNull(): Promise<
  typeof import('expo-application') | null
> {
  try {
    const mod = await Promise.race([
      import('expo-application'),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), EXPO_APPLICATION_IMPORT_MS),
      ),
    ]);
    return mod;
  } catch {
    return null;
  }
}

async function getPersistentOsDeviceId() {
  // Dynamic import: expo-application can crash on iPhone 16 Pro at startup.
  // Defer until auth flow so index screen (getAccessToken only) loads without it.
  const Application = await importExpoApplicationOrNull();
  if (!Application) {
    return null;
  }
  const app = Application as unknown as ApplicationLike;

  if (Platform.OS === 'android') {
    try {
      const androidId =
        (typeof app.getAndroidId === 'function' ? app.getAndroidId() : null) ??
        app.androidId;
      if (androidId) {
        return `android:${androidId}`;
      }
    } catch {
      // Ignore and fallback.
    }
  }

  if (Platform.OS === 'ios') {
    try {
      const iosId =
        (typeof app.getIosIdForVendorAsync === 'function'
          ? await app.getIosIdForVendorAsync()
          : null) ?? app.iosIdForVendor;
      if (iosId) {
        return `ios:${iosId}`;
      }
    } catch {
      // Ignore and fallback.
    }
  }

  return null;
}

// Prefer OS-level identifier so it survives app reinstalls.
export async function getOrCreateDeviceId() {
  const persistentOsId = await getPersistentOsDeviceId();
  if (persistentOsId) {
    return persistentOsId;
  }

  let id: string | null = null;
  try {
    id = await SecureStore.getItemAsync(DEVICE_KEY, KEYCHAIN_OPTIONS);
  } catch {
    id = null;
  }

  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    try {
      await SecureStore.setItemAsync(DEVICE_KEY, id, KEYCHAIN_OPTIONS);
    } catch {
      // Fall back to in-memory only value if secure storage is unavailable.
    }
  }
  return id;
}
