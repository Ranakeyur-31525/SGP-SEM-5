import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { MetricCard } from '../common/MetricCard';
import { useRobotStore } from '../../stores/useRobotStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useBillingStore } from '../../stores/useBillingStore';
import { useTheme } from '../../hooks/useTheme';

interface AdminDashboardProps {
  navigation: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { status, lidar, power, emergencyStop, lift } = useRobotStore();
  const { userAccounts } = useAuthStore();
  const { dischargeRequests } = useBillingStore();

  const pendingDischarges = dischargeRequests.filter((r) => r.status === 'PENDING_ADMIN_APPROVAL');

  // Simulated 50-bed hospital statistics
  const totalBeds = 50;
  const occupiedBeds = 38;
  const occupancyPercent = ((occupiedBeds / totalBeds) * 100).toFixed(0);

  return (
    <View style={styles.container}>
      {/* Supreme Admin System Header */}
      <View style={[styles.adminBanner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={styles.bannerHeader}>
          <View>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Supreme Administrative Command</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Hospital Ops • 5 Floors • 50 Inpatient Beds
            </Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <MaterialCommunityIcons name="shield-crown" size={16} color={colors.warning} />
            <Text style={[styles.adminBadgeText, { color: colors.warning }]}>ROOT ACCESS</Text>
          </View>
        </View>

        {/* 50-Bed Hospital Overview Card */}
        <View style={[styles.bedOverviewBox, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <View style={styles.bedStatRow}>
            <View style={styles.bedStatItem}>
              <Text style={[styles.bedStatNum, { color: colors.textPrimary }]}>{occupiedBeds}/{totalBeds}</Text>
              <Text style={[styles.bedStatLabel, { color: colors.textMuted }]}>Beds Occupied</Text>
            </View>
            <View style={styles.bedStatItem}>
              <Text style={[styles.bedStatNum, { color: colors.success }]}>12</Text>
              <Text style={[styles.bedStatLabel, { color: colors.textMuted }]}>Available Beds</Text>
            </View>
            <View style={styles.bedStatItem}>
              <Text style={[styles.bedStatNum, { color: colors.primary }]}>{occupancyPercent}%</Text>
              <Text style={[styles.bedStatLabel, { color: colors.textMuted }]}>Occupancy Rate</Text>
            </View>
          </View>

          {/* Quick Bed Management Trigger */}
          <TouchableOpacity
            style={[styles.bedManageBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Billing', { bedNumber: 12 })}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bed" size={16} color={colors.textPrimary} />
            <Text style={[styles.bedManageText, { color: colors.textPrimary }]}>
              Manage 50-Bed Allocations & Discharge
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Doctor Discharge Approvals Section */}
      {pendingDischarges.length > 0 && (
        <View style={[styles.dischargeSection, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.dischargeHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="clipboard-check" size={18} color={colors.warning} />
              <Text style={[styles.dischargeTitle, { color: colors.textPrimary }]}>
                Pending Physician Discharge Approvals
              </Text>
            </View>
            <View style={[styles.pendingCountBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.pendingCountText, { color: colors.warning }]}>
                {pendingDischarges.length} Pending
              </Text>
            </View>
          </View>

          {pendingDischarges.map((req) => (
            <View
              key={req.id}
              style={[styles.reqCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
            >
              <View style={styles.reqTop}>
                <Text style={[styles.reqBed, { color: colors.primary }]}>
                  Floor {Math.ceil(req.bedNumber / 10)} • Bed {req.bedNumber}
                </Text>
                <Text style={[styles.reqTime, { color: colors.textMuted }]}>
                  {new Date(req.recommendedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={[styles.reqPatient, { color: colors.textPrimary }]}>
                Patient: {req.patientName}
              </Text>
              <Text style={[styles.reqDoctor, { color: colors.textSecondary }]}>
                Cleared by: {req.doctorName} ({req.doctorRole})
              </Text>
              <Text style={[styles.reqNotes, { color: colors.textMuted }]}>
                "{req.clinicalSummary}"
              </Text>

              <TouchableOpacity
                style={[styles.reviewBtn, { backgroundColor: colors.success }]}
                onPress={() => navigation.navigate('Billing', { bedNumber: req.bedNumber })}
                activeOpacity={0.85}
              >
                <Feather name="check-circle" size={14} color="#FFFFFF" />
                <Text style={styles.reviewBtnText}>Review & Finalize Settle/Discharge</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Fleet Telemetry Summary */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="LiDAR 100Hz Safety"
            value={lidar.distanceCm}
            unit="cm"
            badgeLabel={emergencyStop ? 'E-STOP' : lidar.brakeEngaged ? 'HALT' : 'SECURE'}
            badgeVariant={emergencyStop || lidar.brakeEngaged ? 'danger' : 'success'}
            icon={<MaterialCommunityIcons name="radar" size={16} color={colors.primary} />}
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Lift Node IoT"
            value={`FL-${lift.currentLiftFloor}`}
            badgeLabel={lift.relayState}
            badgeVariant="info"
            icon={<MaterialCommunityIcons name="elevator-passenger" size={16} color={colors.info} />}
          />
        </View>
      </View>

      {/* Admin Operations Grid */}
      <View style={styles.opsGrid}>
        <TouchableOpacity
          style={[styles.opsTile, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.navigate('UserManagement')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: colors.warningLight }]}>
            <Feather name="users" size={22} color={colors.warning} />
          </View>
          <Text style={[styles.tileTitle, { color: colors.textPrimary }]}>Staff Provisioning</Text>
          <Text style={[styles.tileSub, { color: colors.textSecondary }]}>
            {userAccounts.length} Registered staff & patients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opsTile, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ElevatorControl')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: colors.infoLight }]}>
            <MaterialCommunityIcons name="transit-connection" size={22} color={colors.info} />
          </View>
          <Text style={[styles.tileTitle, { color: colors.textPrimary }]}>Lift Node Relay</Text>
          <Text style={[styles.tileSub, { color: colors.textSecondary }]}>Multi-floor ESP32 optocoupler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opsTile, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Battery')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: colors.successLight }]}>
            <MaterialCommunityIcons name="car-battery" size={22} color={colors.success} />
          </View>
          <Text style={[styles.tileTitle, { color: colors.textPrimary }]}>Battery & BMS</Text>
          <Text style={[styles.tileSub, { color: colors.textSecondary }]}>
            {power.batteryPercentage}% • LM2596 5.0V
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opsTile, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Billing', { bedNumber: 12 })}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name="file-chart" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.tileTitle, { color: colors.textPrimary }]}>Hospital Billing</Text>
          <Text style={[styles.tileSub, { color: colors.textSecondary }]}>Compile ledger & PDF invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  adminBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bannerTitle: {
    ...Typography.titleSmall,
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  bedOverviewBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  bedStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bedStatItem: {
    alignItems: 'center',
  },
  bedStatNum: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  bedStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  bedManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  bedManageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dischargeSection: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  dischargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dischargeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  pendingCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  pendingCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reqCard: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reqBed: {
    fontSize: 11,
    fontWeight: '700',
  },
  reqTime: {
    fontSize: 10,
  },
  reqPatient: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  reqDoctor: {
    fontSize: 11,
    marginBottom: 2,
  },
  reqNotes: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  opsTile: {
    flex: 1,
    minWidth: '46%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  tileIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileSub: {
    fontSize: 10,
    lineHeight: 14,
  },
});
