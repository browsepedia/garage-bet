import { Input, InputProps, useTheme } from 'tamagui';

export const ThemedInput = (props: InputProps) => {
  const theme = useTheme();

  return (
    <Input
      placeholderTextColor="$placeholderColor"
      backgroundColor={theme.backgroundHover}
      {...props}
    />
  );
};
