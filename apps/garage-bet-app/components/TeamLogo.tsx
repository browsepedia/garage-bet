import { memo, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';

export type TeamLogoProps = {
  uri: string;
  /** Diameter is `min(maxWidth, maxHeight)` for the circular clip. */
  maxWidth?: number;
  maxHeight?: number;
};

export const TeamLogo = memo(function TeamLogo({
  uri,
  maxWidth = 48,
  maxHeight = 32,
}: TeamLogoProps) {
  const diameter = Math.min(maxWidth, maxHeight);

  const clipStyle = useMemo<ViewStyle>(
    () => ({
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      overflow: 'hidden',
      backgroundColor: '#13161a',
    }),
    [diameter],
  );

  return (
    <View style={clipStyle}>
      <SvgUri
        uri={uri}
        width={diameter}
        height={diameter}
        preserveAspectRatio="xMidYMid meet"
      />
    </View>
  );
});
