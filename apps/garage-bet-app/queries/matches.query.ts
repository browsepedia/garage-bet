import { MatchData } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useMatchesQuery() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const data = await apiJson<MatchData[]>('/matches');

      return data;
    },
  });
}
