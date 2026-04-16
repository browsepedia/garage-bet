import { useLocalSearchParams } from 'expo-router';
import { UserStatsCompareScreenContent } from '../../../../components/UserStatsCompareScreenContent';
import {
  useUserStatsByUserIdQuery,
  useUserStatsQuery,
} from '../../../../queries/user-stats.query';

export default function StatsCompareScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const safeId = typeof userId === 'string' ? userId : userId?.[0];
  const missingUser = !safeId;

  const meQuery = useUserStatsQuery();
  const otherQuery = useUserStatsByUserIdQuery(safeId);

  const refetch = () => Promise.all([meQuery.refetch(), otherQuery.refetch()]);

  const isPending =
    missingUser ||
    meQuery.isPending ||
    (Boolean(safeId) && otherQuery.isPending);
  const isError =
    missingUser || meQuery.isError || (Boolean(safeId) && otherQuery.isError);
  const error = missingUser
    ? new Error('Missing user.')
    : (meQuery.error ?? otherQuery.error);
  const isRefetching = meQuery.isRefetching || otherQuery.isRefetching;

  const me = meQuery.data;
  const other = otherQuery.data;

  const title = other && me ? `${me.name} vs ${other.name}` : 'Compare stats';

  return (
    <UserStatsCompareScreenContent
      title={title}
      primaryLabel="You"
      secondaryLabel={other?.name ?? 'Player'}
      me={me}
      other={other}
      isPending={isPending}
      isRefetching={isRefetching}
      isError={isError}
      error={error}
      refetch={refetch}
    />
  );
}
