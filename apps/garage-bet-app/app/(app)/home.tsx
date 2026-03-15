import { Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { useUserProfileQuery } from '../../queries/user-profile.query';

export default function Home() {
  const { data, isLoading, error } = useUserProfileQuery();
  return (
    <Screen>
      <Text variant="bodyLarge">Home</Text>
      {isLoading && <Text variant="bodyLarge">Loading...</Text>}
      {error && <Text variant="bodyLarge">Error: {error.message}</Text>}
      {data && <Text variant="bodyLarge">Welcome, {data.name}!</Text>}
    </Screen>
  );
}
