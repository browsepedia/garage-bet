import { SeasonListItem } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useSeasonsQuery() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiJson<SeasonListItem[]>('/seasons'),
  });
}
