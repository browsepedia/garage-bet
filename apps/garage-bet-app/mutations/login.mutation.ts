import { LoginFormModel, LoginResponseModel } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getOrCreateDeviceId, setTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginFormModel) => {
      const deviceId = await getOrCreateDeviceId();
      const data = await apiJson<LoginResponseModel>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ ...input, deviceId }),
      });

      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data;
    },
    onSuccess: async () => {
      router.replace('/(app)/today');
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({
        queryKey: ['deviceRegistrationStatus'],
      });
    },
  });
}
