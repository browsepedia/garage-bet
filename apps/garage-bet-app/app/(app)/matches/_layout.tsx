import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function MatchesStackLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[matchId]" options={{ headerShown: false }} />
    </Stack>
  );
}
