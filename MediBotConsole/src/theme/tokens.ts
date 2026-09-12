export interface ThemeTokens {
  // Master Strict 2-Palette Tokens
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  emergency: string;
  success: string;
  warning: string;
  inputBg: string;
  cardShadow: string;

  // Additional Matched Semantic Tokens
  primaryDark: string;
  secondary: string;
  overlay: string;

  // Compatibility & Semantic Aliases
  bgDark: string;
  bgCard: string;
  bgCardSecondary: string;
  bgSurfaceLight: string;
  bgInput: string;
  textInverted: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  successLight: string;
  warningLight: string;
  lidarSafe: string;
  lidarWarn: string;
  lidarHalt: string;
  servoLocked: string;
  servoUnlocked: string;
  batteryGood: string;
  batteryMedium: string;
  batteryLow: string;
}

export const lightTheme: ThemeTokens = {
  background: '#F8FAFC',       // Slate 50
  surface: '#FFFFFF',          // Pure White
  surfaceElevated: '#F1F5F9',  // Slate 100
  border: '#E2E8F0',           // Slate 200
  textPrimary: '#0F172A',      // Slate 900
  textSecondary: '#475569',    // Slate 600
  textMuted: '#94A3B8',        // Slate 400
  primary: '#0284C7',          // Sky 600
  primaryLight: '#E0F2FE',     // Sky 100
  accent: '#0D9488',           // Teal 600
  emergency: '#DC2626',        // Red 600
  success: '#16A34A',          // Green 600
  warning: '#F59E0B',          // Amber 500
  inputBg: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',

  // Matched Semantic Tokens
  primaryDark: '#0369A1',
  secondary: '#6D28D9',
  overlay: 'rgba(15, 23, 42, 0.65)',

  // Compatibility Aliases
  bgDark: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgCardSecondary: '#F1F5F9',
  bgSurfaceLight: '#E2E8F0',
  bgInput: '#FFFFFF',
  textInverted: '#FFFFFF',
  danger: '#DC2626',
  dangerLight: 'rgba(220, 38, 38, 0.12)',
  info: '#0284C7',
  infoLight: 'rgba(2, 132, 199, 0.12)',
  successLight: 'rgba(22, 163, 74, 0.12)',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  lidarSafe: '#16A34A',
  lidarWarn: '#D97706',
  lidarHalt: '#DC2626',
  servoLocked: '#DC2626',
  servoUnlocked: '#16A34A',
  batteryGood: '#16A34A',
  batteryMedium: '#D97706',
  batteryLow: '#DC2626',
};

export const darkTheme: ThemeTokens = {
  background: '#090D16',       // Deep Navy
  surface: '#131C2E',          // Slate Dark Surface
  surfaceElevated: '#1E293B',  // Slate 800
  border: '#27354F',           // Slate 700
  textPrimary: '#F8FAFC',      // Slate 50
  textSecondary: '#CBD5E1',    // Slate 300
  textMuted: '#64748B',        // Slate 500
  primary: '#38BDF8',          // Sky 400
  primaryLight: '#082F49',     // Sky 950
  accent: '#2DD4BF',          // Teal 400
  emergency: '#EF4444',        // Red 500
  success: '#22C55E',          // Green 500
  warning: '#FBBF24',          // Amber 400
  inputBg: '#131C2E',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  // Matched Semantic Tokens
  primaryDark: '#0284C7',
  secondary: '#A855F7',
  overlay: 'rgba(5, 10, 25, 0.85)',

  // Compatibility Aliases
  bgDark: '#090D16',
  bgCard: '#131C2E',
  bgCardSecondary: '#1E293B',
  bgSurfaceLight: '#1E293B',
  bgInput: '#131C2E',
  textInverted: '#090D16',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.2)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  lidarSafe: '#22C55E',
  lidarWarn: '#F59E0B',
  lidarHalt: '#EF4444',
  servoLocked: '#EF4444',
  servoUnlocked: '#22C55E',
  batteryGood: '#22C55E',
  batteryMedium: '#F59E0B',
  batteryLow: '#EF4444',
};

export const LightThemeColors = lightTheme;
export const DarkThemeColors = darkTheme;
export type ThemeColors = ThemeTokens;

// Default export of dynamic tokens
export const Colors: ThemeTokens = { ...darkTheme };

export const updateGlobalColors = (isDark: boolean) => {
  Object.assign(Colors, isDark ? darkTheme : lightTheme);
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Typography = {
  titleLarge: { fontSize: 24, fontWeight: '700' as const },
  titleMedium: { fontSize: 20, fontWeight: '600' as const },
  titleSmall: { fontSize: 16, fontWeight: '600' as const },
  bodyLarge: { fontSize: 15, fontWeight: '400' as const },
  bodyRegular: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const },
  monoSmall: { fontSize: 12, fontFamily: 'monospace' },
  monoMedium: { fontSize: 14, fontFamily: 'monospace' },
};
