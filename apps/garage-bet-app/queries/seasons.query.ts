import { SeasonListItemSchema } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiJson } from '../utils/http-client';

const SeasonsResponseSchema = z.array(SeasonListItemSchema);

export function useSeasonsQuery() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const raw = await apiJson<unknown>('/seasons');
      const parsed = SeasonsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          parsed.error.issues[0]?.message ??
            'Seasons response was not a valid list. Check API version and database.',
        );
      }
      return parsed.data;
    },
  });
}
