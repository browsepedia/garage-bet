import { UserStats } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUserStatsQuery(seasonId: string | 'all') {
  return useQuery({
    queryKey: ['leaderboard', 'me', 'stats', seasonId],
    queryFn: () =>
      apiJson<UserStats>(`/leaderboard/me/stats?seasonId=${seasonId}`),
  });
}

export function useUserStatsByUserIdQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['leaderboard', 'user', userId, 'stats'],
    queryFn: () => apiJson<UserStats>(`/leaderboard/user/${userId}/stats`),
    enabled: Boolean(userId),
  });
}
