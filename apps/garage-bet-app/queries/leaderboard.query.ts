import { LeaderboardEntry } from '@garage-bet/models';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

const PAGE_SIZE = 50;

export function useLeaderboardQuery() {
  return useInfiniteQuery({
    queryKey: ['leaderboard'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return apiJson<LeaderboardEntry[]>(`/leaderboard?page=${pageParam}`);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
  });
}
