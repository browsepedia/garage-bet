import { LeaderboardEntryWithRank } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useLeaderboardMeQuery() {
  return useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: async () => {
      return apiJson<LeaderboardEntryWithRank>('/leaderboard/me');
    },
  });
}
