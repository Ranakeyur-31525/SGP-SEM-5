import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { useRole } from '../../hooks/useRole';
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';

// Dedicated Role Dashboards
import { PatientBedDashboard } from '../../components/dashboard/PatientBedDashboard';
import { DoctorDashboard } from '../../components/dashboard/DoctorDashboard';
import { NurseDashboard } from '../../components/dashboard/NurseDashboard';
import { ChemistDashboard } from '../../components/dashboard/ChemistDashboard';
import { AdminDashboard } from '../../components/dashboard/AdminDashboard';

export const DashboardScreen = ({ navigation }: any) => {
  const { currentUser, isPatient, isDoctor, isNurse, isChemist, isAdmin } = useRole();
  const { lidar, emergencyStop } = useRobotStore();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header subtitle={`${currentUser.name} • ${currentUser.role}`} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Safety Warning Banner if LiDAR obstacle < 100cm or E-Stop (for clinical & ops staff) */}
        {!isPatient && (lidar.distanceCm < 100 || emergencyStop) && (
          <TouchableOpacity
            style={[
              styles.criticalBanner,
              {
                backgroundColor:
                  emergencyStop || lidar.distanceCm <= 30
                    ? colors.dangerLight
                    : colors.warningLight,
                borderColor:
                  emergencyStop || lidar.distanceCm <= 30
                    ? colors.danger
                    : colors.warning,
              },
            ]}
            onPress={() => navigation.navigate('RobotMonitoring')}
          >
            <Feather
              name={
                emergencyStop || lidar.distanceCm <= 30
                  ? 'alert-octagon'
                  : 'alert-triangle'
              }
              size={18}
              color={
                emergencyStop || lidar.distanceCm <= 30
                  ? colors.danger
                  : colors.warning
              }
            />
            <View style={styles.criticalBannerTextGroup}>
              <Text
                style={[
                  styles.criticalBannerTitle,
                  {
                    color:
                      emergencyStop || lidar.distanceCm <= 30
                        ? colors.danger
                        : colors.warning,
                  },
                ]}
              >
                {emergencyStop
                  ? 'CRITICAL MANUAL E-STOP ACTIVE'
                  : lidar.distanceCm <= 30
                  ? `SAFETY BRAKE HALT (${lidar.distanceCm}cm <= 30cm)`
                  : `PROXIMITY WARNING (${lidar.distanceCm}cm < 100cm)`}
              </Text>
              <Text style={[styles.criticalBannerSub, { color: colors.textSecondary }]}>
                Tap to view 2D Floorplan & LiDAR Diagnostics →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* DEDICATED ROLE DASHBOARD */}
        {isPatient && <PatientBedDashboard navigation={navigation} />}
        {isDoctor && <DoctorDashboard navigation={navigation} />}
        {isNurse && <NurseDashboard navigation={navigation} />}
        {isChemist && <ChemistDashboard navigation={navigation} />}
        {isAdmin && <AdminDashboard navigation={navigation} />}
      </ScrollView>
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
  },
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  criticalBannerTextGroup: {
    flex: 1,
  },
  criticalBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  criticalBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
