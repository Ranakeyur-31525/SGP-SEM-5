import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeTokens, lightTheme, darkTheme, updateGlobalColors } from '../theme/tokens';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  themeMode: ThemeMode;
  theme: ThemeTokens;
  colors: ThemeTokens;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  loadSavedTheme: () => Promise<void>;
}

const STORAGE_KEY = '@medibot_theme_preference';

const syncWebStyles = (tokens: ThemeTokens, mode: ThemeMode) => {
  if (typeof document !== 'undefined') {
    try {
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.style.backgroundColor = tokens.background;
      document.body.style.backgroundColor = tokens.background;
      const root = document.getElementById('root');
      if (root) {
        root.style.backgroundColor = tokens.background;
      }
    } catch {
      // ignore in non-dom environments
    }
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark',
  theme: darkTheme,
  colors: darkTheme,
  isDark: true,

  toggleTheme: () => {
    const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    get().setThemeMode(nextMode);
  },

  setThemeMode: (mode: ThemeMode) => {
    const isDark = mode === 'dark';
    const tokens = isDark ? darkTheme : lightTheme;
    updateGlobalColors(isDark);
    syncWebStyles(tokens, mode);
    set({ themeMode: mode, theme: tokens, colors: tokens, isDark });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },

  setTheme: (mode: ThemeMode) => {
    get().setThemeMode(mode);
  },

  loadSavedTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        const isDark = saved === 'dark';
        const tokens = isDark ? darkTheme : lightTheme;
        updateGlobalColors(isDark);
        syncWebStyles(tokens, saved);
        set({
          themeMode: saved,
          theme: tokens,
          colors: tokens,
          isDark,
        });
      }
    } catch {
      // fallback default dark
    }
  },
}));

// Initialize theme on module load
useThemeStore.getState().loadSavedTheme();
