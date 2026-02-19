import { SetBetPayload } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useSetBetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetBetPayload) => {
      const response = await apiJson<void>('/bets', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  });
}
