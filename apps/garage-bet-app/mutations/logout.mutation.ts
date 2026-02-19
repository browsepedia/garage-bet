import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { clearTokens } from '../storage/token-storage';

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // call backend logout if you want (recommended)
      // If you do, you need refreshToken in body; implement api for it.
      await clearTokens();
      router.replace('/(auth)/login');
    },
    onSuccess: () => {
      qc.clear(); // wipe cached data on logout
    },
  });
}
