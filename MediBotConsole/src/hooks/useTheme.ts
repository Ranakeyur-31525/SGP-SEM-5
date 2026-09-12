import { useThemeStore } from '../stores/useThemeStore';

export const useTheme = () => {
  const { theme, colors, isDark, themeMode, toggleTheme, setThemeMode, setTheme } = useThemeStore();
  return { theme, colors, isDark, themeMode, toggleTheme, setThemeMode, setTheme };
};
