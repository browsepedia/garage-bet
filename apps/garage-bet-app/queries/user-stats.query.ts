import { UserStats } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUserStatsQuery(seasonId: string | 'all') {
  return useQuery({
    queryKey: ['leaderboard', 'me', 'stats', seasonId],
    queryFn: () =>
      apiJson<UserStats>(
        seasonId === 'all'
          ? '/leaderboard/me/stats'
          : `/leaderboard/me/stats?seasonId=${seasonId}`,
      ),
  });
}

export function useUserStatsByUserIdQuery(
  userId: string | undefined,
  seasonId: string | 'all' = 'all',
) {
  return useQuery({
    queryKey: ['leaderboard', 'user', userId, 'stats', seasonId],
    queryFn: () =>
      apiJson<UserStats>(
        seasonId === 'all'
          ? `/leaderboard/user/${userId}/stats`
          : `/leaderboard/user/${userId}/stats?seasonId=${seasonId}`,
      ),
    enabled: Boolean(userId),
  });
}
