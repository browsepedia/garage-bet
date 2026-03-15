import type { ComponentProps } from 'react';
import { TextInput } from 'react-native-paper';

type ThemedInputProps = Omit<
  ComponentProps<typeof TextInput>,
  'mode' | 'theme'
>;

export const ThemedInput = (props: ThemedInputProps) => {
  return (
    <TextInput
      mode="outlined"
      placeholderTextColor="#a1a1aa"
      outlineColor="#273042"
      activeOutlineColor="#EA580C"
      {...props}
    />
  );
};
