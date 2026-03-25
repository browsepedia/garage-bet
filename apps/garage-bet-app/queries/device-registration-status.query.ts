import type { UserProfileModel } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { getOrCreateDeviceId } from '../storage/token-storage';
import { ApiError, apiJson } from '../utils/http-client';

export type DeviceStatusResponse = {
  registered: boolean;
  user: UserProfileModel | null;
};

/**
 * `registered` = this device id already has its one allowed device-only user (email null).
 * Other users with email may also be linked to the same device id.
 */
export function useDeviceRegistrationStatusQuery() {
  return useQuery({
    queryKey: ['deviceRegistrationStatus'],
    queryFn: async (): Promise<DeviceStatusResponse> => {
      const deviceId = (await getOrCreateDeviceId()).trim();

      if (!deviceId) {
        return { registered: false, user: null };
      }

      try {
        return await apiJson<DeviceStatusResponse>('/auth/device/status', {
          method: 'POST',
          body: JSON.stringify({ deviceId }),
        });
      } catch {
        return { registered: false, user: null };
      }
    },
    retry: (failureCount, err) => {
      if (err instanceof ApiError && [400, 401, 404].includes(err.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
