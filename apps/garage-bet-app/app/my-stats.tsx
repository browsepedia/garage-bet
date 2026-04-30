import { UserStatsScreenContent } from '../components/UserStatsScreenContent';
import { useUserStatsQuery } from '../queries/user-stats.query';

export default function MyStatsScreen() {
  const { data, isPending, isRefetching, isError, error, refetch } =
    useUserStatsQuery();

  return (
    <UserStatsScreenContent
      title="Your stats"
      data={data}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      error={error}
      refetch={refetch}
    />
  );
}
