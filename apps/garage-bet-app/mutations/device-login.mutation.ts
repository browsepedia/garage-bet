import { LoginResponseModel } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getOrCreateDeviceId, setTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useDeviceLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const deviceId = await getOrCreateDeviceId();
      const data = await apiJson<LoginResponseModel>('/auth/device/login', {
        method: 'POST',
        body: JSON.stringify({ deviceId }),
      });

      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    },
    onSuccess: async () => {
      router.replace('/(app)/home');
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({
        queryKey: ['deviceRegistrationStatus'],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
