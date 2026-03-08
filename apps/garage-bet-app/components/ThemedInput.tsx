import { useTheme } from '@tamagui/core';
import { Input } from '@tamagui/input';
import type { ComponentProps } from 'react';

type ThemedInputProps = ComponentProps<typeof Input>;

export const ThemedInput = (props: ThemedInputProps) => {
  const theme = useTheme();

  return (
    <Input
      placeholderTextColor="$placeholderColor"
      backgroundColor={theme.backgroundHover}
      {...props}
    />
  );
};
