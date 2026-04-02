import { UserStats } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUserStatsQuery() {
  return useQuery({
    queryKey: ['leaderboard', 'me', 'stats'],
    queryFn: () => apiJson<UserStats>('/leaderboard/me/stats'),
  });
}
