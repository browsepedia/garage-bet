import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,

  themes: {
    ...defaultConfig.themes,

    light: {
      ...defaultConfig.themes.light,

      background: '#ffffff',
      backgroundHover: '#F3F4F6',
      placeholderColor: '#71717a',

      // Brand
      brand: '#EA580C',
      brandHover: '#FB923C',
      brandPress: '#F97316',
      brandForeground: '#ffffff',
    },

    dark: {
      ...defaultConfig.themes.dark,

      borderColor: '#273042',

      background: '#0A0F1C',
      backgroundHover: '#121A2B',
      placeholderColor: '#a1a1aa',
      

      // Brand (slightly brighter for dark mode contrast)
      brand: '#EA580C',
      brandHover: '#F97316',
      brandPress: '#F97316',
      brandForeground: '#ffffff',
    },
  },

  useSystemColorMode: true,
})

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;


