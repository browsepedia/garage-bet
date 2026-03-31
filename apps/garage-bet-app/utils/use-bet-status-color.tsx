import { MatchBetListItem } from '@garage-bet/models';
import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';

export function useBetStatusColor(
  status: MatchBetListItem['betStatus'],
): string {
  const theme = useTheme<AppTheme>();

  return useMemo(() => {
    switch (status) {
      case 'WON':
        return theme.colors.success;
      case 'LOST':
        return theme.colors.error;
      case 'RESULT':
        return theme.colors.info;
      case 'SET':
        return theme.colors.onSurfaceVariant;
    }
  }, [status, theme]);
}
