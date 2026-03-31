import { MatchData } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useMatchesBySeasonQuery(seasonId: string | null) {
  return useQuery({
    queryKey: ['matches', 'season', seasonId],
    queryFn: async () => {
      if (!seasonId) {
        throw new Error('seasonId is required');
      }
      const data = await apiJson<MatchData[]>(
        `/matches/season/${encodeURIComponent(seasonId)}`,
      );
      return data;
    },
    enabled: Boolean(seasonId),
  });
}
