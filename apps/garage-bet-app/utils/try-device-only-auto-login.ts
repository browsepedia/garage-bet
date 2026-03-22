import { LoginResponseModel } from '@garage-bet/models';
import { getOrCreateDeviceId, setTokens } from '../storage/token-storage';
import { ApiError, apiJson } from './http-client';

/**
 * If this install’s device is registered to a user without email, stores tokens and returns true.
 * Otherwise returns false (no throw — caller sends user to the auth flow).
 */
export async function tryDeviceOnlyAutoLogin(): Promise<boolean> {
  let deviceId: string;
  try {
    deviceId = await getOrCreateDeviceId();
  } catch {
    return false;
  }
  if (!deviceId) return false;

  try {
    const data = await apiJson<LoginResponseModel>('/auth/device/auto', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
    await setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return true;
  } catch (e) {
    if (e instanceof ApiError && __DEV__) {
      console.info(
        '[auth] Device-only auto login skipped:',
        e.status,
        e.message,
      );
    }
    return false;
  }
}
