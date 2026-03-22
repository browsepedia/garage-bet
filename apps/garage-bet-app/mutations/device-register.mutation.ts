import {
  DeviceRegisterFormModel,
  LoginResponseModel,
} from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { setTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useDeviceRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeviceRegisterFormModel) => {
      const data = await apiJson<LoginResponseModel>('/auth/device/register', {
        method: 'POST',
        body: JSON.stringify(input),
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
    },
  });
}
