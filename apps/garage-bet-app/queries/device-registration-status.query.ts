import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

type DeviceStatusResponse = { registered: boolean };

export function useDeviceRegistrationStatusQuery(
  deviceId: string | null | undefined,
) {
  return useQuery({
    queryKey: ['deviceRegistrationStatus', deviceId],
    queryFn: async () => {
      const data = await apiJson<DeviceStatusResponse>('/auth/device/status', {
        method: 'POST',
        body: JSON.stringify({ deviceId: deviceId!.trim() }),
      });
      return data;
    },
    enabled: Boolean(deviceId?.trim()),
  });
}
