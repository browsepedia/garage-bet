import {
  AnonymousRegisterFormModel,
  LoginResponseModel,
} from '@garage-bet/models';
import { useMutation } from '@tanstack/react-query';
import { setTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useAnonymousRegisterMutation() {
  return useMutation({
    mutationFn: async (input: AnonymousRegisterFormModel) => {
      const data = await apiJson<LoginResponseModel>(
        '/auth/anonymous-register',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );

      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    },
  });
}
