import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'garage-bet-access-token';
const REFRESH_KEY = 'garage-bet-refresh-token';
const DEVICE_KEY = 'garage-bet-device-key';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}
export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}
export async function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}
export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// recommended: stable deviceId per install
export async function getOrCreateDeviceId() {
  let id = await SecureStore.getItemAsync(DEVICE_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    await SecureStore.setItemAsync(DEVICE_KEY, id);
  }
  return id;
}
