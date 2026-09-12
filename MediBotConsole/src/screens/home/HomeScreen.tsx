import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useTheme';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { PersonaSelectorModal } from '../../components/common/PersonaSelectorModal';
import { RootStackParamList } from '../../navigation/types';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const { currentUser, isAuthenticated } = useAuthStore();
  const { isPatient, isDoctor, isNurse, isChemist, isAdmin } = useRole();
  const { status, lidar, power, hatchState, currentFloor } = useRobotStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [personaModalVisible, setPersonaModalVisible] = useState(false);

  const getRoleBadge = () => {
    if (isPatient) return { label: 'PATIENT • BED 12', color: theme.warning };
    if (isDoctor) return { label: 'DOCTOR • STAT MD', color: theme.emergency };
    if (isNurse) return { label: 'STAFF NURSE • RN', color: theme.primary };
    if (isChemist) return { label: 'REGISTERED CHEMIST', color: theme.accent };
    return { label: 'FACILITY ADMIN', color: theme.primary };
  };

  const badge = getRoleBadge();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        subtitle="Autonomous Intra-Hospital Logistics & Safety Platform"
        onPersonaPress={() => setPersonaModalVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Public Hospital Welcome Banner & Auth Gateway CTA */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.livePill, { backgroundColor: theme.success + '22', borderColor: theme.success }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.livePillText, { color: theme.success }]}>FLEET READY • ONLINE</Text>
            </View>

            <TouchableOpacity
              style={[styles.themeToggleBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={() => navigation.navigate('Settings' as any)}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={14} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Hospital Logistics & Autonomous Care
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Real-time multi-floor automated delivery linking Central Dispensary, Wards, and Bed Units 1–50.
          </Text>

          {/* Quick Action / Login Gateway Button */}
          <View style={styles.authCtaContainer}>
            {isAuthenticated ? (
              <View style={styles.authRow}>
                <TouchableOpacity
                  style={[styles.mainCtaBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    if (isChemist) navigation.navigate('Chemist' as any);
                    else if (isPatient) navigation.navigate('Patient' as any);
                    else if (isAdmin) navigation.navigate('Admin' as any);
                    else navigation.navigate('MainTabs' as any);
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="view-dashboard" size={18} color="#FFFFFF" />
                  <Text style={[styles.mainCtaText, { color: '#FFFFFF' }]}>
                    Launch {currentUser.role} Console
                  </Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryCtaBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="account-switch" size={18} color={theme.primary} />
                  <Text style={[styles.secondaryCtaText, { color: theme.primary }]}>Switch Persona</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.mainCtaBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="login-variant" size={18} color="#FFFFFF" />
                <Text style={[styles.mainCtaText, { color: '#FFFFFF' }]}>
                  Sign In to Hospital Portal (Demo Personas)
                </Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Live Broadcast / Notice Ticker */}
        <View style={[styles.broadcastBar, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <MaterialCommunityIcons name="bullhorn-outline" size={18} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.broadcastTitle, { color: theme.primary }]}>HOSPITAL OPS DISPATCH</Text>
            <Text style={[styles.broadcastText, { color: theme.textPrimary }]} numberOfLines={1}>
              MediBot-01 Active • TF-Luna 100Hz LiDAR • Multi-Floor Elevator Node Linked
            </Text>
          </View>
        </View>

        {/* Hospital Facility Counters */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="hospital-building" size={22} color={theme.primary} />
            <Text style={[styles.statNum, { color: theme.textPrimary }]}>5 Floors</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Wards & ICU</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="bed" size={22} color={theme.accent} />
            <Text style={[styles.statNum, { color: theme.textPrimary }]}>44 / 50</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Bed Occupancy</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="robot" size={22} color={theme.success} />
            <Text style={[styles.statNum, { color: theme.textPrimary }]}>
              {status === 'EMERGENCY_STOP' ? 'HALTED' : 'STANDBY'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>MediBot-01</Text>
          </View>
        </View>

        {/* Robot Fleet Status Summary Card */}
        <View style={[styles.fleetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.fleetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.fleetTitle, { color: theme.textPrimary }]}>MediBot-01 Telemetry Status</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('RobotMonitoring' as any)}
              style={styles.radarLink}
            >
              <Text style={[styles.radarLinkText, { color: theme.primary }]}>Radar Detail &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fleetTelemetryGrid}>
            <View style={[styles.telemetryCell, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.cellLabel, { color: theme.textMuted }]}>LiDAR Clearance</Text>
              <Text style={[styles.cellValue, { color: theme.lidarSafe }]}>
                {lidar?.distanceCm ?? 148} cm
              </Text>
            </View>

            <View style={[styles.telemetryCell, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.cellLabel, { color: theme.textMuted }]}>Power Bus</Text>
              <Text style={[styles.cellValue, { color: theme.batteryGood }]}>
                {power?.batteryPercentage ?? 86}% ({power?.batteryVoltage ?? 8.12}V)
              </Text>
            </View>

            <View style={[styles.telemetryCell, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.cellLabel, { color: theme.textMuted }]}>Hatch Servo</Text>
              <Text style={[styles.cellValue, { color: hatchState === 'UNLOCKED' ? theme.servoUnlocked : theme.servoLocked }]}>
                {hatchState === 'UNLOCKED' ? 'UNLOCKED' : 'LOCKED (SG90)'}
              </Text>
            </View>

            <View style={[styles.telemetryCell, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.cellLabel, { color: theme.textMuted }]}>Corridor Node</Text>
              <Text style={[styles.cellValue, { color: theme.primary }]}>
                Floor {currentFloor ?? 2} - Junc 4
              </Text>
            </View>
          </View>
        </View>

        {/* Authenticated User Session Overview */}
        {isAuthenticated && (
          <View style={[styles.sessionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sessionHeader}>
              <View style={[styles.roleBadge, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
                <Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
              <Text style={[styles.sessionName, { color: theme.textPrimary }]}>{currentUser.name}</Text>
              <Text style={[styles.sessionDept, { color: theme.textMuted }]}>
                {currentUser.department || 'Healthcare Facility'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Quick Navigation Shortcuts Based on Role */}
            <View style={styles.shortcutsRow}>
              {isDoctor && (
                <>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('DoctorOrder' as any)}
                  >
                    <MaterialCommunityIcons name="clipboard-plus" size={20} color={theme.emergency} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>STAT Prescribe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('CallingMatrix')}
                  >
                    <MaterialCommunityIcons name="bell-ring" size={20} color={theme.primary} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Code Red & Calls</Text>
                  </TouchableOpacity>
                </>
              )}

              {isChemist && (
                <>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('Chemist' as any)}
                  >
                    <MaterialCommunityIcons name="store-cog" size={20} color={theme.accent} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Chemist Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('DeliveryCreate' as any)}
                  >
                    <MaterialCommunityIcons name="robot" size={20} color={theme.primary} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Dispatch Bot</Text>
                  </TouchableOpacity>
                </>
              )}

              {isNurse && (
                <>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('CallingMatrix')}
                  >
                    <MaterialCommunityIcons name="bell-ring" size={20} color={theme.primary} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Bed Calls</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('DeliveryDetail' as any)}
                  >
                    <MaterialCommunityIcons name="lock-open" size={20} color={theme.success} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Hatch Unlock</Text>
                  </TouchableOpacity>
                </>
              )}

              {isPatient && (
                <>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('Patient' as any)}
                  >
                    <MaterialCommunityIcons name="bed" size={20} color={theme.primary} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Bed 12 Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('CallingMatrix')}
                  >
                    <MaterialCommunityIcons name="alarm-light" size={20} color={theme.emergency} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Bedside Call</Text>
                  </TouchableOpacity>
                </>
              )}

              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('Admin' as any)}
                  >
                    <MaterialCommunityIcons name="shield-crown" size={20} color={theme.primary} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Admin Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shortcutBtn, { backgroundColor: theme.surfaceElevated }]}
                    onPress={() => navigation.navigate('RobotMonitoring')}
                  >
                    <MaterialCommunityIcons name="radar" size={20} color={theme.accent} />
                    <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Radar & LiDAR</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <PersonaSelectorModal
        visible={personaModalVisible}
        onClose={() => setPersonaModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  heroCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  authCtaContainer: {
    marginTop: Spacing.xs,
  },
  authRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mainCtaBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
  },
  mainCtaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCtaBtn: {
    height: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryCtaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  broadcastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  broadcastTitle: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  broadcastText: {
    fontSize: 11,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  fleetCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fleetTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  radarLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  radarLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fleetTelemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  telemetryCell: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  cellLabel: {
    fontSize: 10,
  },
  cellValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  sessionCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  sessionHeader: {
    alignItems: 'flex-start',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionDept: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    gap: 4,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
