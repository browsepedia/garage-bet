import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  getLastSyncedExpoPushSignature,
  getOrCreateDeviceId,
  setLastSyncedExpoPushSignature,
} from '../storage/token-storage';
import { apiFetch } from '../utils/http-client';
import { getExpoPushTokenOrNull } from '../utils/push-notifications';

type Props = {
  /** Set when `/me` has loaded successfully (user is authenticated). */
  enabled: boolean;
};

/**
 * Registers the Expo push token with the API for the current app install device.
 * Runs once per session when the token or device id changes.
 */
export function ExpoPushTokenSync({ enabled }: Props) {
  const syncing = useRef(false);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let cancelled = false;

    (async () => {
      if (syncing.current) return;
      syncing.current = true;
      try {
        const token = await getExpoPushTokenOrNull();
        console.log('token', token);
        if (cancelled || !token) {
          return;
        }

        const deviceId = await getOrCreateDeviceId();
        const signature = `${deviceId}:${token}`;
        const last = await getLastSyncedExpoPushSignature();
        if (last === signature) {
          return;
        }

        console.log('syncing push token', signature, deviceId, token);

        const res = await apiFetch('/me/push-token', {
          method: 'POST',
          body: JSON.stringify({ deviceId, expoPushToken: token }),
        });

        if (!res.ok) {
          if (__DEV__) {
            console.warn('[push] Register token failed', res.status);
          }
          return;
        }

        await setLastSyncedExpoPushSignature(signature);
      } catch (e) {
        if (__DEV__) {
          console.warn('[push] Sync error', e);
        }
      } finally {
        syncing.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return null;
}
