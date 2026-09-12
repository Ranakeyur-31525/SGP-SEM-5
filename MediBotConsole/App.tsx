import React, { useEffect, useMemo } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { mqttService } from './src/services/mqttService';
import { useThemeStore } from './src/stores/useThemeStore';

import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  const { theme, isDark, themeMode } = useThemeStore();

  useEffect(() => {
    // Start live telemetry polling and simulation loop
    mqttService.startAutonomousSimulation();

    return () => {
      mqttService.stopAutonomousSimulation();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
      document.documentElement.style.backgroundColor = theme.background;
      document.body.style.backgroundColor = theme.background;
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = theme.background;
    }
  }, [theme.background, themeMode]);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.primary,
        background: theme.background,
        card: theme.surface,
        text: theme.textPrimary,
        border: theme.border,
        notification: theme.emergency,
      },
    };
  }, [isDark, theme]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.background} />
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
