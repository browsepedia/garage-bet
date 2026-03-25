import { LoginResponseModel, RegisterFormModel } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getOrCreateDeviceId, setTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterFormModel) => {
      const deviceId = await getOrCreateDeviceId();
      const data = await apiJson<LoginResponseModel>('/auth/register', {
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
      router.replace('/(app)/home');
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({
        queryKey: ['deviceRegistrationStatus'],
      });
    },
  });
}
