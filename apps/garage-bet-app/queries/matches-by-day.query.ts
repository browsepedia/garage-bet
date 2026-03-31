import { MatchData } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useMatchesByDayQuery(date: string, timeZone: string) {
  return useQuery({
    queryKey: ['matches', 'day', date, timeZone],
    queryFn: async () => {
      const params = new URLSearchParams({ date, timeZone });
      const data = await apiJson<MatchData[]>(
        `/matches/day?${params.toString()}`,
      );
      return data;
    },
    enabled: Boolean(date && timeZone),
  });
}
