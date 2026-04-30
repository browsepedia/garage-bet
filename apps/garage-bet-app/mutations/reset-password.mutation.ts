import { useMutation } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (dto: { token: string; newPassword: string }) =>
      apiJson<{ ok: true }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  });
}
