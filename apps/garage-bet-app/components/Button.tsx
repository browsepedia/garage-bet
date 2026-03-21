import type { ComponentProps } from 'react';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import type { AppTheme } from '../theme';

export type ButtonProps = ComponentProps<typeof PaperButton> & {
  compact?: boolean;
};

export function Button({ compact = false, ...props }: ButtonProps) {
  const theme = useTheme<AppTheme>();
  const overrides = theme.components?.Button;

  if (!overrides || !compact) {
    return <PaperButton {...props} />;
  }

  return (
    <PaperButton
      {...props}
      style={[overrides.style, props.style]}
      contentStyle={[overrides.contentStyle, props.contentStyle]}
      labelStyle={[overrides.labelStyle, props.labelStyle]}
    />
  );
}
