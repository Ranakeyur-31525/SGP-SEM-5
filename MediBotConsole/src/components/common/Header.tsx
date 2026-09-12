import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Radius, Spacing } from '../../theme/tokens';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';
import { resetToHome, goBack as navGoBack } from '../../navigation/navigationRef';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSignout?: boolean;
  showPersonaSwitch?: boolean;
  onPersonaPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'MediBot Console',
  subtitle,
  showBack,
  onBack,
  showSignout = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isAuthenticated, logout, currentUser } = useAuthStore();
  const { status, lidar, emergencyStop } = useRobotStore();
  const { colors, isDark, toggleTheme } = useTheme();

  let currentRoute = '';
  try {
    const route = useRoute();
    currentRoute = route?.name || '';
  } catch (e) {
    currentRoute = '';
  }

  const isHomeOrWelcome = currentRoute === 'Home' || currentRoute === 'Welcome';
  const canGoBack = showBack !== undefined ? showBack : !isHomeOrWelcome;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const parentNav = navigation?.getParent?.();
    if (parentNav && typeof parentNav.canGoBack === 'function' && parentNav.canGoBack()) {
      parentNav.goBack();
      return;
    }
    navGoBack();
  };

  const handleSignout = () => {
    logout();
    resetToHome();
  };

  const getStatusColor = () => {
    if (emergencyStop || lidar.brakeEngaged) return colors.danger;
    if (status === 'TRANSIT') return colors.primary;
    if (status === 'ARRIVED_BED') return colors.success;
    return colors.warning;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top, 12) + 6,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          {canGoBack && (
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={handleBack}
              activeOpacity={0.7}
              accessibilityLabel="Navigate back"
              accessibilityRole="button"
            >
              <Feather name="arrow-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={styles.brandRow}>
            <View style={[styles.robotIconCircle, { borderColor: getStatusColor(), backgroundColor: colors.surfaceElevated }]}>
              <MaterialCommunityIcons name="robot-industrial" size={20} color={getStatusColor()} />
            </View>
            <View>
              <View style={styles.titleWithDot}>
                <Text style={[styles.appTitle, { color: colors.textPrimary }]}>{title}</Text>
                <View style={[styles.liveDot, { backgroundColor: getStatusColor() }]} />
              </View>
              <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
                {emergencyStop
                  ? 'CRITICAL E-STOP'
                  : lidar.brakeEngaged
                  ? 'LIDAR BRAKE <=30cm'
                  : `ESP32: ${status} • ${lidar.distanceCm}cm`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Quick Theme Toggle Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
            accessibilityLabel="Toggle dark/light theme"
            accessibilityRole="button"
          >
            <Feather
              name={isDark ? 'sun' : 'moon'}
              size={16}
              color={isDark ? '#F59E0B' : colors.primary}
            />
          </TouchableOpacity>

          {/* Dedicated Signout Button */}
          {showSignout && (isAuthenticated || !isHomeOrWelcome) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
              onPress={handleSignout}
              activeOpacity={0.8}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Feather name="log-out" size={16} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {subtitle && (
        <View style={styles.subtitleRow}>
          <Text style={[styles.customSubtitle, { color: colors.primary }]}>{subtitle}</Text>
          {isAuthenticated && currentUser && (
            <View style={[styles.rolePill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.rolePillText, { color: colors.textSecondary }]}>{currentUser.role}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  robotIconCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusSubtext: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs + 2,
  },
  customSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
