import { MatchData } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useMatchesQuery(seasonId: string | 'all') {
  return useQuery({
    queryKey: ['matches', 'season', seasonId],
    queryFn: async () => {
      if (!seasonId) {
        throw new Error('seasonId is required');
      }

      if (seasonId === 'all') {
        const data = await apiJson<MatchData[]>('/matches');
        return data;
      }

      const data = await apiJson<MatchData[]>(
        `/matches/season/${encodeURIComponent(seasonId)}`,
      );
      return data;
    },
  });
}
