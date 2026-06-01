import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { clearTokens } from '../storage/token-storage';
import { apiJson } from '../utils/http-client';

export function useDeleteAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiJson<{ ok: true }>('/me', { method: 'DELETE' });
      await clearTokens();
      router.replace('/(auth)/login');
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}
