import { UserProfileModel } from '@garage-bet/models';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../utils/http-client';

export function useUserProfileQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await apiJson<UserProfileModel>('/me');

      return data;
    },
  });
}
