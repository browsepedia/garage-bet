import { FinalBetContext } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useFinalBetQuery(seasonId: string | null) {
  return useQuery({
    queryKey: ['final-bet', seasonId],
    queryFn: () => apiJson<FinalBetContext>(`/seasons/${seasonId}/final-bet`),
    enabled: Boolean(seasonId),
  });
}
