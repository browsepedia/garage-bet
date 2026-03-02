import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'garage-bet-access-token';
const REFRESH_KEY = 'garage-bet-refresh-token';
const DEVICE_KEY = 'garage-bet-device-key';

// iOS 26 requires explicit keychainService or SecureStore throws NSException at init
const KEYCHAIN_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'com.browsepedia.garagebet',
};

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY, KEYCHAIN_OPTIONS);
}
export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY, KEYCHAIN_OPTIONS);
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
  await SecureStore.deleteItemAsync(ACCESS_KEY, KEYCHAIN_OPTIONS);
  await SecureStore.deleteItemAsync(REFRESH_KEY, KEYCHAIN_OPTIONS);
}

// recommended: stable deviceId per install
export async function getOrCreateDeviceId() {
  let id = await SecureStore.getItemAsync(DEVICE_KEY, KEYCHAIN_OPTIONS);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    await SecureStore.setItemAsync(DEVICE_KEY, id, KEYCHAIN_OPTIONS);
  }
  return id;
}
