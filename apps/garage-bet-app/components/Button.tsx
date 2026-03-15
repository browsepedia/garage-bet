import type { ComponentProps } from 'react';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import type { AppTheme } from '../theme';

const compactModes = ['contained', 'contained-tonal', 'elevated'] as const;

export function Button(props: ComponentProps<typeof PaperButton>) {
  const theme = useTheme<AppTheme>();
  const overrides = theme.components?.Button;
  const isCompact =
    props.mode &&
    compactModes.includes(props.mode as (typeof compactModes)[number]);

  if (!overrides || !isCompact) {
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
