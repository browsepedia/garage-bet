import { LeaderboardEntry } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useLeaderboardQuery(seasonId: string | 'all') {
  return useQuery({
    queryKey: ['leaderboard', 'season', seasonId],
    queryFn: () =>
      apiJson<LeaderboardEntry[]>(
        `/leaderboard${seasonId !== 'all' ? `?seasonId=${seasonId}` : ''}`,
      ),
  });
}
