import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';

interface DemoPersonaButton {
  role: UserRole;
  label: string;
  email: string;
  sub: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colorKey: 'emergency' | 'primary' | 'accent' | 'warning' | 'textPrimary';
}

const DEMO_BUTTONS: DemoPersonaButton[] = [
  {
    role: 'DOCTOR',
    label: 'Doctor (MD)',
    email: 'doc@hospital.com',
    sub: 'STAT Bed Prescribing & Formulary',
    icon: 'doctor',
    colorKey: 'emergency',
  },
  {
    role: 'NURSE',
    label: 'Nurse (RN)',
    email: 'nurse@hospital.com',
    sub: 'Ward Intercom & SG90 Hatch Unlock',
    icon: 'account-heart',
    colorKey: 'primary',
  },
  {
    role: 'CHEMIST',
    label: 'Chemist (R.Ph)',
    email: 'chemist@hospital.com',
    sub: 'Restock, Approvals & Mission Dispatch',
    icon: 'pill',
    colorKey: 'accent',
  },
  {
    role: 'PATIENT',
    label: 'Patient (Bed 12)',
    email: 'bed12@hospital.com',
    sub: 'Bed Assistance, Med Tracking & Invoice',
    icon: 'bed',
    colorKey: 'warning',
  },
  {
    role: 'ADMIN',
    label: 'Admin (Lead)',
    email: 'admin@hospital.com',
    sub: 'Full ERP Oversight & Fleet Telemetry',
    icon: 'shield-crown',
    colorKey: 'textPrimary',
  },
];

export const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('doc@hospital.com');
  const [password, setPassword] = useState('••••••••');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { loginWithCredentials, loginAsPersona } = useAuthStore();

  const handleLogin = () => {
    loginWithCredentials(email);
    if (navigation?.navigate) {
      navigation.navigate('MainTabs');
    }
  };

  const handleQuickPersona = (role: UserRole, targetEmail: string) => {
    setEmail(targetEmail);
    loginAsPersona(role);
    if (navigation?.navigate) {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <MaterialCommunityIcons name="robot-vacuum" size={38} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>MediBot Console</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Hospital Logistics & Autonomous Care ERP Gateway
          </Text>

          {/* Mode Switcher Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isRegisterMode && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
              ]}
              onPress={() => setIsRegisterMode(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isRegisterMode ? theme.primary : theme.textMuted, fontWeight: !isRegisterMode ? '700' : '500' },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                isRegisterMode && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
              ]}
              onPress={() => setIsRegisterMode(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isRegisterMode ? theme.primary : theme.textMuted, fontWeight: isRegisterMode ? '700' : '500' },
                ]}
              >
                Register Staff
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1-Tap Persona Switcher for Quick Demos */}
        <View
          style={[
            styles.quickAccessCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.quickTitleRow}>
            <Feather name="zap" size={16} color={theme.primary} />
            <Text style={[styles.quickTitle, { color: theme.primary }]}>
              1-Tap Demo Persona Switcher
            </Text>
          </View>
          <Text style={[styles.quickDesc, { color: theme.textSecondary }]}>
            Tap any role to immediately authenticate and verify isolated navigation, permissions, and theme:
          </Text>

          <View style={styles.personaList}>
            {DEMO_BUTTONS.map((item) => {
              const itemColor = theme[item.colorKey];
              return (
                <TouchableOpacity
                  key={item.role}
                  style={[
                    styles.personaBtn,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => handleQuickPersona(item.role, item.email)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.personaIconBox,
                      {
                        backgroundColor: itemColor + '22',
                        borderColor: itemColor,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={item.icon} size={20} color={itemColor} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.personaHeaderRow}>
                      <Text style={[styles.personaLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                      <Text style={[styles.personaEmail, { color: theme.textMuted }]}>{item.email}</Text>
                    </View>
                    <Text style={[styles.personaSub, { color: theme.textSecondary }]}>{item.sub}</Text>
                  </View>

                  <Feather name="arrow-right" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Traditional Credentials Input Form */}
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
            {isRegisterMode ? 'New Hospital Staff Account' : 'Credentials Sign In'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Hospital Email</Text>
            <View
              style={[
                styles.inputField,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="mail" size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={email}
                onChangeText={setEmail}
                placeholder="name@hospital.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password / Access Key</Text>
            <View
              style={[
                styles.inputField,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="lock" size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginSubmitBtn, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginSubmitText, { color: '#FFFFFF' }]}>
              {isRegisterMode ? 'Register & Enter Console' : 'Authenticate & Launch Console'}
            </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerNote, { color: theme.textMuted }]}>
          ESP32 Firmware v2.4 • TF-Luna LiDAR • SG90 Lock • 50 Beds Active
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: Radius.xl,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    marginTop: Spacing.md,
    borderWidth: 1,
    width: 220,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
  },
  quickAccessCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  quickTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  personaList: {
    gap: Spacing.xs + 2,
  },
  personaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  personaIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personaLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  personaEmail: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  personaSub: {
    fontSize: 11,
    marginTop: 2,
  },
  formCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
  },
  loginSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  loginSubmitText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: Spacing.sm,
  },
});
