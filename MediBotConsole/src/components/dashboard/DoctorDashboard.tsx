import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { MetricCard } from '../common/MetricCard';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useBillingStore } from '../../stores/useBillingStore';
import { useTheme } from '../../hooks/useTheme';

interface DoctorDashboardProps {
  navigation: any;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { alerts, resolveAlert } = useCallingMatrixStore();
  const { deliveries } = useDeliveryStore();
  const { dischargeRequests } = useBillingStore();

  const codeRedAlerts = alerts.filter((a) => a.recipient === 'DOCTOR' && !a.isResolved);
  const activePrescriptions = deliveries.filter((d) => d.status !== 'RETURN_TO_DOCK');
  const myPendingRequests = dischargeRequests.filter((r) => r.status === 'PENDING_ADMIN_APPROVAL');

  return (
    <View style={styles.container}>
      {/* Shift & Clinical Status Card */}
      <View style={[styles.shiftCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shiftHeader}>
          <View>
            <Text style={[styles.shiftTitle, { color: colors.textPrimary }]}>Critical Care & ICU Duty</Text>
            <Text style={[styles.shiftSub, { color: colors.textSecondary }]}>
              Shift: Day Shift (08:00 - 20:00) • On-Call Attending
            </Text>
          </View>
          <View style={[styles.activeDutyBadge, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
            <View style={[styles.greenPulse, { backgroundColor: colors.success }]} />
            <Text style={[styles.activeDutyText, { color: colors.success }]}>ON DUTY</Text>
          </View>
        </View>

        {/* Big Action: Instant STAT Emergency Dispatch */}
        <TouchableOpacity
          style={[styles.statPrescribeBtn, { backgroundColor: isDark ? '#EF4444' : '#DC2626' }]}
          onPress={() => navigation.navigate('DoctorOrder')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="ambulance" size={24} color="#FFFFFF" />
          <View style={styles.statBtnTextBox}>
            <Text style={styles.statBtnTitle}>DISPATCH EMERGENCY STAT PRESCRIPTION</Text>
            <Text style={styles.statBtnSub}>Priority lift preemption & immediate compartment load</Text>
          </View>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Clinical Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Code Red Alerts"
            value={codeRedAlerts.length}
            unit="Urgent"
            badgeLabel={codeRedAlerts.length > 0 ? 'CRITICAL' : 'ALL CLEAR'}
            badgeVariant={codeRedAlerts.length > 0 ? 'danger' : 'success'}
            icon={<MaterialCommunityIcons name="alarm-light" size={16} color={isDark ? '#EF4444' : '#DC2626'} />}
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Active Missions"
            value={activePrescriptions.length}
            unit="Deliveries"
            badgeLabel="EN ROUTE"
            badgeVariant="primary"
            icon={<MaterialCommunityIcons name="robot" size={16} color={colors.primary} />}
          />
        </View>
      </View>

      {/* Doctor Discharge Clearance Banner */}
      <View style={[styles.dischargeBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.dischargeBannerLeft}>
          <MaterialCommunityIcons name="doctor" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dischargeBannerTitle, { color: colors.textPrimary }]}>
              Patient Discharge Recommendations
            </Text>
            <Text style={[styles.dischargeBannerSub, { color: colors.textSecondary }]}>
              {myPendingRequests.length > 0
                ? `${myPendingRequests.length} clearance request(s) awaiting Admin final authorization.`
                : 'Evaluate patient stability and submit clinical clearance to Admin.'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.dischargeActionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Billing', { bedNumber: 12 })}
          activeOpacity={0.85}
        >
          <Feather name="file-text" size={14} color="#FFFFFF" />
          <Text style={styles.dischargeActionText}>Request Discharge</Text>
        </TouchableOpacity>
      </View>

      {/* Urgent Code Red Patient Feed */}
      <View style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: isDark ? '#EF4444' : '#DC2626' }]}>
        <View style={[styles.feedHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.feedTitleGroup}>
            <MaterialCommunityIcons name="bell-ring" size={18} color={isDark ? '#EF4444' : '#DC2626'} />
            <Text style={[styles.feedTitle, { color: colors.textPrimary }]}>Physician Code Red Queue</Text>
          </View>
          <Text style={[styles.feedCount, { color: isDark ? '#EF4444' : '#DC2626' }]}>{codeRedAlerts.length} Active</Text>
        </View>

        {codeRedAlerts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Feather name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active patient distress emergencies.</Text>
          </View>
        ) : (
          codeRedAlerts.map((item) => (
            <View
              key={item.id}
              style={[
                styles.codeRedItem,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                  borderColor: isDark ? '#EF4444' : '#DC2626',
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemBedText, { color: colors.textPrimary }]}>Floor {item.floor} • Bed {item.bedNumber}</Text>
                <Text style={[styles.itemTime, { color: colors.textMuted }]}>{item.timestamp}</Text>
              </View>
              <Text style={[styles.itemPatient, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>Patient: {item.patientName}</Text>
              <Text style={[styles.itemReason, { color: colors.textSecondary }]}>{item.reason}</Text>

              <TouchableOpacity
                style={[styles.resolveBtn, { backgroundColor: isDark ? '#EF4444' : '#DC2626' }]}
                onPress={() => resolveAlert(item.id, 'Dr. Anita Mehta, MD')}
              >
                <Feather name="check" size={14} color="#FFFFFF" />
                <Text style={styles.resolveText}>Attend & Resolve Alarm</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Quick Clinical Tools Grid (No Formulary for Doctor) */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          style={[styles.toolTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('DoctorOrder')}
        >
          <MaterialCommunityIcons name="clipboard-plus" size={24} color={colors.primary} />
          <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>STAT Prescribe</Text>
          <Text style={[styles.toolSub, { color: colors.textMuted }]}>Bed 1-50 orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CallingMatrix')}
        >
          <MaterialCommunityIcons name="alarm-light" size={24} color={isDark ? '#EF4444' : '#DC2626'} />
          <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>Code Red</Text>
          <Text style={[styles.toolSub, { color: colors.textMuted }]}>50-Bed matrix</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('RobotMonitoring')}
        >
          <MaterialCommunityIcons name="radar" size={24} color={colors.accent} />
          <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>Fleet Radar</Text>
          <Text style={[styles.toolSub, { color: colors.textMuted }]}>LiDAR safety</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  shiftCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shiftTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  shiftSub: {
    fontSize: 11,
    marginTop: 2,
  },
  activeDutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDutyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statPrescribeBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statBtnTextBox: {
    flex: 1,
  },
  statBtnTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
  },
  dischargeBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dischargeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  dischargeBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  dischargeBannerSub: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  dischargeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
  },
  dischargeActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs + 2,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  feedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  feedCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  codeRedItem: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs + 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemBedText: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemTime: {
    fontSize: 10,
  },
  itemPatient: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  itemReason: {
    fontSize: 11,
    marginVertical: 4,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  resolveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toolTile: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  toolSub: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
