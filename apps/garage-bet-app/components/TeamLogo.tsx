import { memo } from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';

export type TeamLogoProps = {
  uri: string;
  /** Diameter is `min(maxWidth, maxHeight)` for the circular clip. */
  maxWidth?: number;
  maxHeight?: number;
};

export const TeamLogo = memo(function TeamLogo({ uri }: TeamLogoProps) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: '#13161a',
      }}
    >
      <SvgUri uri={uri} width={32} height={32} />
    </View>
  );
});
