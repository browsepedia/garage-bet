import { UpsertFinalBetPayload } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUpsertFinalBetMutation(seasonId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpsertFinalBetPayload) => {
      if (!seasonId) throw new Error('No season selected');
      return apiJson(`/seasons/${seasonId}/final-bet`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['final-bet', seasonId] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
