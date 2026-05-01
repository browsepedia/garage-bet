import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

const brand = '#EA580C';
const brandHover = '#F97316';

const buttonCompact = {
  style: { flexShrink: 0, alignSelf: 'flex-start' as const },
  contentStyle: { paddingVertical: 0, paddingHorizontal: 4, minHeight: 24 },
  labelStyle: { fontSize: 12, marginVertical: 2, marginHorizontal: 6 },
} as const;

export type AppThemeColors = MD3Theme['colors'] & {
  success: string;
  warning: string;
  /** Blue tone for informational copy (e.g. “result” bet outcome). */
  info: string;
};

export type AppTheme = Omit<MD3Theme, 'colors'> & {
  colors: AppThemeColors;
  components?: {
    Button?: {
      style?: object;
      contentStyle?: object;
      labelStyle?: object;
    };
  };
  spacing: (factor: number) => number;
  spacingUnit: number; // 8
};

const cardBackground = '#13161a';

const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  components: {
    Button: buttonCompact,
  },
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand,
    onPrimary: '#ffffff',
    primaryContainer: brandHover,
    secondary: brand,
    surface: '#111418',
    surfaceVariant: cardBackground,
    background: '#111418',
    outline: '#3f3f46',
    outlineVariant: '#3f3f46',
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#a1a1aa',
    error: '#ef4444',
    errorContainer: '#7f1d1d',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#60a5fa',
    backdrop: 'transparent',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level3: cardBackground,
    },
  },
  roundness: 8,
  spacing: (factor) => factor * 8,
  spacingUnit: 8,
};

const lightTheme: AppTheme = {
  ...MD3LightTheme,
  components: {
    Button: buttonCompact,
  },
  colors: {
    ...MD3LightTheme.colors,
    primary: brand,
    primaryContainer: brandHover,
    secondary: brand,
    surface: '#ffffff',
    surfaceVariant: '#F3F4F6',
    background: '#ffffff',
    outline: '#e5e7eb',
    onSurface: '#1f2937',
    onSurfaceVariant: '#71717a',
    error: '#dc2626',
    errorContainer: '#fef2f2',
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',
    backdrop: 'transparent',
  },
  roundness: 8,
  spacing: (factor) => factor * 8,
  spacingUnit: 8,
};

export { darkTheme, lightTheme };
