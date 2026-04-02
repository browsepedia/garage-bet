import { Pressable, View } from 'react-native';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import { AppTheme } from '../theme';

export default function PressableCheckbox({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
}) {
  const theme = useTheme<AppTheme>();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Group by outcome"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: -8,
      }}
    >
      <View pointerEvents="none">
        <Checkbox.Android
          status={checked ? 'checked' : 'unchecked'}
          color={theme.colors.primary}
          uncheckedColor={theme.colors.onSurfaceVariant}
        />
      </View>
      <Text variant="bodyLarge" style={{ marginLeft: 8 }}>
        {label}
      </Text>
    </Pressable>
  );
}
