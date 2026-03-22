import type { FinalBetListItem } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useFinalBetsListQuery(seasonId: string | null) {
  return useQuery({
    queryKey: ['final-bets-list', seasonId],
    queryFn: () => apiJson<FinalBetListItem[]>(`/seasons/${seasonId}/final-bets`),
    enabled: Boolean(seasonId),
  });
}
