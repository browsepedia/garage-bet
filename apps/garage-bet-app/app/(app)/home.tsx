import { Text } from 'tamagui';
import { Screen } from '../../components/Screen';
import { useUserProfileQuery } from '../../queries/user-profile.query';

export default function Home() {
  const { data, isLoading, error } = useUserProfileQuery();
  return (
    <Screen>
      <Text>Home</Text>
      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {data && <Text>Welcome, {data.name}!</Text>}
    </Screen>
  );
}
