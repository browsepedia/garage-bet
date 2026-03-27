import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Screen = ({ children, style }: ScreenProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
