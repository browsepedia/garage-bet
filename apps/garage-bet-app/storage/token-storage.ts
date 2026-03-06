import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'garage-bet-access-token';
const REFRESH_KEY = 'garage-bet-refresh-token';
const DEVICE_KEY = 'garage-bet-device-key';
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
  ]);
}

// recommended: stable deviceId per install
export async function getOrCreateDeviceId() {
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
