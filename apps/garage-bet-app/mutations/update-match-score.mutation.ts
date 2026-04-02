import { UpdateMatchScorePayload } from '@garage-bet/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUpdateMatchScoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: UpdateMatchScorePayload & { matchId: string },
    ) => {
      const { matchId, ...body } = input;
      return apiJson<{ ok: true }>(`/matches/${matchId}/score`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches', 'season'] });
      queryClient.invalidateQueries({ queryKey: ['matches', 'day'] });
      queryClient.invalidateQueries({
        queryKey: ['match-bets', variables.matchId],
      });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
