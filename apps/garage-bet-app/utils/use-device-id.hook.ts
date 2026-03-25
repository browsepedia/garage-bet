import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '../storage/token-storage';

export type UseDeviceIdResult = {
  deviceId: string;
  /** False until `getOrCreateDeviceId()` has finished (success or failure). */
  isDeviceIdReady: boolean;
};

export function useDeviceId(): UseDeviceIdResult {
  const [state, setState] = useState<UseDeviceIdResult>({
    deviceId: '',
    isDeviceIdReady: false,
  });

  useEffect(() => {
    let cancelled = false;
    getOrCreateDeviceId()
      .then((id) => {
        if (!cancelled) {
          setState({ deviceId: id, isDeviceIdReady: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ deviceId: '', isDeviceIdReady: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
