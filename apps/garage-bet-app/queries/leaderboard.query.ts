import { LeaderboardEntry } from '@garage-bet/models';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

const PAGE_SIZE = 50;

export function useLeaderboardQuery(seasonId: string | 'all') {
  return useInfiniteQuery({
    queryKey: ['leaderboard', 'season', seasonId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const result = await apiJson<LeaderboardEntry[]>(
        `/leaderboard?page=${pageParam}&${seasonId !== 'all' ? `seasonId=${seasonId}` : ''}`,
      );

      return result;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
  });
}
