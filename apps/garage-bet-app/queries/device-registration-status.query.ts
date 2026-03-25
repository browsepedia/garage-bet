import { useQuery } from '@tanstack/react-query';
import { getOrCreateDeviceId } from '../storage/token-storage';
import { ApiError, apiJson } from '../utils/http-client';

type DeviceStatusResponse = { registered: boolean };

/**
 * Loads the device id inside the query so `queryFn` always runs (no separate
 * `useEffect` + `enabled` gate that can stay false if storage/OS id never flips ready).
 */
export function useDeviceRegistrationStatusQuery() {
  return useQuery({
    queryKey: ['deviceRegistrationStatus'],
    queryFn: async (): Promise<DeviceStatusResponse> => {
      const deviceId = (await getOrCreateDeviceId()).trim();

      console.log('deviceId', deviceId);
      if (!deviceId) {
        return { registered: false };
      }

      console.log('apiJson');
      try {
        const result = await apiJson<DeviceStatusResponse>(
          '/auth/device/status',
          {
            method: 'POST',
            body: JSON.stringify({ deviceId }),
          },
        );

        console.log('result', result);
        return result;
      } catch (error) {
        console.log('error', error);
        return { registered: false };
      }
    },
    retry: (failureCount, err) => {
      console.log('retry', failureCount, err);
      if (err instanceof ApiError && [400, 401, 404].includes(err.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
