import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';

interface NurseDashboardProps {
  navigation: any;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { getActiveDelivery } = useDeliveryStore();
  const { alerts, resolveAlert } = useCallingMatrixStore();
  const { hatchState } = useRobotStore();

  const activeDelivery = getActiveDelivery();
  const nurseCalls = alerts.filter((a) => (a.recipient === 'NURSE' || a.recipient === 'PEON') && !a.isResolved);

  return (
    <View style={styles.container}>
      {/* Nursing Station Ward Summary */}
      <View style={[styles.wardCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.wardHeader}>
          <View>
            <Text style={[styles.wardTitle, { color: colors.textPrimary }]}>Floor 3 Nursing Station</Text>
            <Text style={[styles.wardSub, { color: colors.textSecondary }]}>
              Assigned Ward Beds: 21 - 30 • General & Post-Op Care
            </Text>
          </View>
          <View style={[styles.nurseBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="account-heart" size={16} color={colors.primary} />
            <Text style={[styles.nurseBadgeText, { color: colors.primary }]}>STAFF ON DUTY</Text>
          </View>
        </View>

        {/* Primary Action: Bedside OTP Unlock for SG90 Servo */}
        {activeDelivery ? (
          <View style={[styles.hatchCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.hatchHeader}>
              <View style={styles.hatchTitleRow}>
                <MaterialCommunityIcons
                  name={hatchState === 'UNLOCKED' ? 'lock-open-variant' : 'lock'}
                  size={20}
                  color={hatchState === 'UNLOCKED' ? colors.success : colors.warning}
                />
                <Text style={[styles.hatchTitle, { color: colors.textPrimary }]}>
                  Mission at Bed {activeDelivery.targetBed} (Floor {activeDelivery.targetFloor})
                </Text>
              </View>
              <Text style={[styles.hatchStateText, { color: colors.primary }]}>SG90: {hatchState}</Text>
            </View>

            <Text style={[styles.hatchDesc, { color: colors.textSecondary }]}>
              Passcode assigned: <Text style={{ color: colors.primary, fontWeight: '800' }}>{activeDelivery.passcode}</Text>. Verify payload at bedside and unlock servo.
            </Text>

            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: activeDelivery.id, autoOpenPin: true })}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="shield-key" size={18} color="#FFFFFF" />
              <Text style={styles.unlockBtnText}>
                Enter 4-Digit Passcode & Unlock Compartment
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.hatchCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.hatchTitleRow}>
              <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
              <Text style={[styles.hatchTitle, { color: colors.textPrimary }]}>Autonomous Fleet Standby</Text>
            </View>
            <Text style={[styles.hatchDesc, { color: colors.textSecondary, marginTop: 4 }]}>
              No active deliveries awaiting PIN unlock at your station. Ready for bedside dispatch.
            </Text>
          </View>
        )}

        {/* Quick Replenishment Request Action for Nurse */}
        <TouchableOpacity
          style={[styles.wardOrderBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('DoctorOrder')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="medical-bag" size={20} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.wardOrderTitle}>REQUEST WARD PHARMACY REPLENISHMENT</Text>
            <Text style={styles.wardOrderSub}>Request IV fluids, dressing kits, and bedside supplies</Text>
          </View>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Patient Call Bells & Assistance Queue */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.cardHeaderGroup}>
            <Feather name="bell" size={16} color={colors.warning} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Inpatient Call Bell Queue</Text>
          </View>
          <Text style={[styles.cardBadge, { color: colors.warning }]}>{nurseCalls.length} Pending</Text>
        </View>

        {nurseCalls.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>All ward call bells resolved and calm.</Text>
          </View>
        ) : (
          nurseCalls.map((item) => (
            <View key={item.id} style={[styles.callItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.callItemTop}>
                <Text style={[styles.callBed, { color: colors.primary }]}>Bed {item.bedNumber} (Floor {item.floor})</Text>
                <Text style={[styles.callTime, { color: colors.textMuted }]}>{item.timestamp}</Text>
              </View>
              <Text style={[styles.callPatient, { color: colors.textPrimary }]}>Patient: {item.patientName}</Text>
              <Text style={[styles.callReason, { color: colors.textSecondary }]}>{item.reason}</Text>

              <TouchableOpacity
                style={[styles.attendBtn, { backgroundColor: colors.warning }]}
                onPress={() => resolveAlert(item.id, 'Sarah Joseph, RN')}
                activeOpacity={0.85}
              >
                <Feather name="check" size={14} color="#FFFFFF" />
                <Text style={styles.attendText}>Attend Bedside Alarm</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Quick Navigation Tiles */}
      <View style={styles.quickNavRow}>
        <TouchableOpacity
          style={[styles.navTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CallingMatrix')}
        >
          <MaterialCommunityIcons name="bell-ring" size={24} color={colors.warning} />
          <Text style={[styles.navTileTitle, { color: colors.textPrimary }]}>Bed Calls</Text>
          <Text style={[styles.navTileSub, { color: colors.textMuted }]}>Summons 1-50</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('DeliveryDetail', { autoOpenPin: true })}
        >
          <MaterialCommunityIcons name="lock-open-outline" size={24} color={colors.primary} />
          <Text style={[styles.navTileTitle, { color: colors.textPrimary }]}>Hatch Unlock</Text>
          <Text style={[styles.navTileSub, { color: colors.textMuted }]}>4-digit PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('DoctorOrder')}
        >
          <MaterialCommunityIcons name="pill" size={24} color={colors.accent} />
          <Text style={[styles.navTileTitle, { color: colors.textPrimary }]}>Ward Order</Text>
          <Text style={[styles.navTileSub, { color: colors.textMuted }]}>Meds & IV</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  wardCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  wardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  wardTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  wardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  nurseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  nurseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hatchCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  hatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hatchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hatchTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  hatchStateText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hatchDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  unlockBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wardOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  wardOrderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  wardOrderSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs + 2,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  cardHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  callItem: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs + 2,
  },
  callItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callBed: {
    fontSize: 12,
    fontWeight: '800',
  },
  callTime: {
    fontSize: 10,
  },
  callPatient: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  callReason: {
    fontSize: 11,
    marginVertical: 4,
  },
  attendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  attendText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  navTile: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navTileTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  navTileSub: {
    fontSize: 9,
    marginTop: 2,
  },
});
