import type { MatchBetListItem } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useMatchBetsQuery(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match-bets', matchId],
    queryFn: async () => {
      const data = await apiJson<MatchBetListItem[]>(
        `/matches/${matchId}/bets`,
      );
      return data;
    },
    enabled: Boolean(matchId),
  });
}
