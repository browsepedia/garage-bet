import { Paragraph } from '@tamagui/text';
import { Screen } from '../../components/Screen';
import { useUserProfileQuery } from '../../queries/user-profile.query';

export default function Home() {
  const { data, isLoading, error } = useUserProfileQuery();
  return (
    <Screen>
      <Paragraph>Home</Paragraph>
      {isLoading && <Paragraph>Loading...</Paragraph>}
      {error && <Paragraph>Error: {error.message}</Paragraph>}
      {data && <Paragraph>Welcome, {data.name}!</Paragraph>}
    </Screen>
  );
}
