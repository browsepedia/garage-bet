import { useState } from 'react';
import { UserStatsScreenContent } from '../components/UserStatsScreenContent';
import { useUserStatsQuery } from '../queries/user-stats.query';

export default function MyStatsScreen() {
  const [seasonId, setSeasonId] = useState<string | 'all'>('all');

  const { data, isPending, isRefetching, isError, error, refetch } =
    useUserStatsQuery(seasonId);

  return (
    <UserStatsScreenContent
      title="Your stats"
      data={data}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      error={error}
      refetch={refetch}
      seasonId={seasonId}
      setSeasonId={setSeasonId}
    />
  );
}
