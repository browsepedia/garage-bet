import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Screen = ({ children, style }: ScreenProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing(2),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
