import { useLocalSearchParams } from 'expo-router';
import { UserStatsScreenContent } from '../../../components/UserStatsScreenContent';
import { useUserStatsByUserIdQuery } from '../../../queries/user-stats.query';

export default function UserStatsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const safeId = typeof userId === 'string' ? userId : userId?.[0];
  const missingUser = !safeId;
  const { data, isPending, isRefetching, isError, error, refetch } =
    useUserStatsByUserIdQuery(safeId);

  const title = data ? `${data.name}'s stats` : 'Player stats';

  return (
    <UserStatsScreenContent
      title={title}
      data={data}
      isPending={!missingUser && isPending}
      isRefetching={isRefetching}
      isError={missingUser || isError}
      error={missingUser ? new Error('Missing user.') : error}
      refetch={refetch}
    />
  );
}
