import { useMutation } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiJson<{ ok: true }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  });
}
