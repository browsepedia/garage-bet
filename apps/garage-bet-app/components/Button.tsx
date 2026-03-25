import type { ComponentProps } from 'react';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import type { AppTheme } from '../theme';

type PaperButtonProps = ComponentProps<typeof PaperButton>;

export type ButtonProps = Omit<PaperButtonProps, 'color'> & {
  compact?: boolean;
  /** Background fill; maps to Paper `buttonColor` (contained / elevated / tonal). */
  backgroundColor?: string;
  /** Label and icon color; maps to Paper `textColor`. */
  color?: string;
  /** Border color; sets `borderWidth: 1` on the button surface. */
  borderColor?: string;
};

export function Button({
  compact = false,
  backgroundColor,
  color,
  borderColor,
  style,
  contentStyle,
  labelStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme<AppTheme>();
  const overrides = theme.components?.Button;

  const borderStyle = borderColor
    ? { borderColor, borderWidth: 1 as const }
    : undefined;

  const paperProps: PaperButtonProps = {
    ...props,
    ...(backgroundColor !== undefined ? { buttonColor: backgroundColor } : {}),
    ...(color !== undefined ? { textColor: color } : {}),
    style: [borderStyle, style],
    ...(contentStyle !== undefined ? { contentStyle } : {}),
    ...(labelStyle !== undefined ? { labelStyle } : {}),
  };

  if (!overrides || !compact) {
    return <PaperButton {...paperProps} />;
  }

  return (
    <PaperButton
      {...paperProps}
      style={[overrides.style, borderStyle, style]}
      contentStyle={[overrides.contentStyle, contentStyle]}
      labelStyle={[overrides.labelStyle, labelStyle]}
    />
  );
}
