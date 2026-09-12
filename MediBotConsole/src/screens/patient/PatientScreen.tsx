import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDeliveryStore, STAGES_FLOW } from '../../stores/useDeliveryStore';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';
import { AlertRecipient, AlertSeverity } from '../../types';

export const PatientScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuthStore();
  const { deliveries, activeDeliveryId } = useDeliveryStore();
  const { alerts, triggerAlert } = useCallingMatrixStore();
  const { status: robotStatus, currentFloor, lidar } = useRobotStore();

  const [lastCallNotice, setLastCallNotice] = useState<string | null>(null);

  // Strictly locked to Bed 12
  const BED_NUMBER = 12;
  const FLOOR_NUMBER = 2;
  const WARD_NAME = 'Ward 3B (Cardiology Post-Op)';

  // Find delivery heading to Bed 12
  const bedDelivery =
    deliveries.find((d) => d.targetBed === BED_NUMBER && d.status !== 'RETURN_TO_DOCK') ||
    deliveries.find((d) => d.targetBed === BED_NUMBER) ||
    deliveries[0];

  const myAlerts = alerts.filter((a) => a.bedNumber === BED_NUMBER);

  const handleSummon = (recipient: AlertRecipient, severity: AlertSeverity, reason: string) => {
    triggerAlert({
      bedNumber: BED_NUMBER,
      floor: FLOOR_NUMBER,
      recipient,
      severity,
      patientName: currentUser.name || 'Ramesh Sharma',
      reason,
    });

    setLastCallNotice(`Summon dispatched to ${recipient}: "${reason}". Response team notified.`);
    setTimeout(() => setLastCallNotice(null), 5000);
  };

  const getStageStep = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
        return 1;
      case 'CHEMIST_LOADED':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'ARRIVED_AT_BED':
        return 4;
      case 'PASSCODE_UNLOCKED':
        return 5;
      case 'RETURN_TO_DOCK':
      default:
        return 6;
    }
  };

  const currentStep = bedDelivery ? getStageStep(bedDelivery.status) : 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        subtitle={`Patient Terminal • Bed ${BED_NUMBER} • ${WARD_NAME}`}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* BED ALLOCATION ENVELOPE */}
        <View style={[styles.envelopeCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.envelopeLeft}>
            <Text style={[styles.envelopeBadge, { color: colors.primary }]}>ALLOCATED INPATIENT SUITE</Text>
            <Text style={[styles.envelopeHeading, { color: colors.textPrimary }]}>
              Bed #{BED_NUMBER} • Floor {FLOOR_NUMBER}
            </Text>
            <Text style={[styles.envelopePatient, { color: colors.textSecondary }]}>
              Patient: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{currentUser.name || 'Ramesh Sharma'}</Text>
            </Text>
            <Text style={[styles.envelopeDiag, { color: colors.textMuted }]}>
              Condition: Acute Coronary Syndrome (Post-PTCA Stent)
            </Text>
          </View>
          <View style={[styles.envelopeIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name="bed-outline" size={32} color={colors.primary} />
          </View>
        </View>

        {/* FEEDBACK BANNER */}
        {lastCallNotice && (
          <View style={[styles.noticeBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.noticeText, { color: colors.success }]}>{lastCallNotice}</Text>
          </View>
        )}

        {/* ASSISTANT MATRIX: 1-Tap Summons */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="bell-ring" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bedside Assistance Matrix</Text>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            1-tap instant summons routed to Floor 2 Nursing Station and Duty Caretakers
          </Text>

          {/* DOCTOR: STAT MEDICAL */}
          <TouchableOpacity
            style={[
              styles.summonBtn,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
                borderColor: isDark ? '#EF4444' : '#DC2626',
              },
            ]}
            onPress={() =>
              handleSummon(
                'DOCTOR',
                'CODE_RED',
                'Acute chest tightness / critical physician summons'
              )
            }
            activeOpacity={0.85}
          >
            <View style={[styles.summonIconCircle, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2' }]}>
              <MaterialCommunityIcons name="ambulance" size={24} color={isDark ? '#EF4444' : '#DC2626'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summonTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>DOCTOR • STAT MEDICAL</Text>
              <Text style={[styles.summonDesc, { color: colors.textSecondary }]}>
                Chest discomfort, acute shortness of breath, dizziness
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#EF4444' : '#DC2626'} />
          </TouchableOpacity>

          {/* NURSE: BEDSIDE HELP */}
          <TouchableOpacity
            style={[
              styles.summonBtn,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.14)' : '#FFFBEB',
                borderColor: isDark ? '#F59E0B' : '#D97706',
              },
            ]}
            onPress={() =>
              handleSummon(
                'NURSE',
                'ASSISTANCE',
                'IV drip alarming / pain medicine request'
              )
            }
            activeOpacity={0.85}
          >
            <View style={[styles.summonIconCircle, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7' }]}>
              <MaterialCommunityIcons name="doctor" size={24} color={isDark ? '#FBBF24' : '#D97706'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summonTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>NURSE • BEDSIDE HELP</Text>
              <Text style={[styles.summonDesc, { color: colors.textSecondary }]}>
                IV cannula check, repositioning, dressing or vitals
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
          </TouchableOpacity>

          {/* PEON: WATER / SANITIZATION */}
          <TouchableOpacity
            style={[
              styles.summonBtn,
              {
                backgroundColor: isDark ? 'rgba(2, 132, 199, 0.14)' : '#F0F9FF',
                borderColor: isDark ? '#38BDF8' : '#0284C7',
              },
            ]}
            onPress={() =>
              handleSummon(
                'PEON',
                'SERVICE',
                'Fresh drinking water bottle refill / clean blanket'
              )
            }
            activeOpacity={0.85}
          >
            <View style={[styles.summonIconCircle, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.25)' : '#E0F2FE' }]}>
              <MaterialCommunityIcons name="water-pump" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summonTitle, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>PEON • WATER & LINEN</Text>
              <Text style={[styles.summonDesc, { color: colors.textSecondary }]}>
                Warm drinking water, sanitization, room assistance
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* TRACK MED: REAL-TIME PROGRESS TRACKER */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="radar" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Track Med • MEDIBOT En Route</Text>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Live autonomous navigation telemetry to Bed #{BED_NUMBER}
          </Text>

          {bedDelivery ? (
            <View style={styles.trackerContainer}>
              <View style={[styles.missionBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.missionNumber, { color: colors.primary }]}>{bedDelivery.orderNumber}</Text>
                  <Text style={[styles.missionItems, { color: colors.textSecondary }]}>
                    {bedDelivery.items.map((i) => `${i.drug.name} (x${i.quantity})`).join(', ')}
                  </Text>
                </View>
                <StatusBadge label={bedDelivery.status} variant="primary" size="sm" />
              </View>

              {/* Visual Transit Steps */}
              <View style={styles.stepsFlow}>
                {[
                  { step: 1, label: 'Order Prescribed', icon: 'clipboard-text' },
                  { step: 2, label: 'Chemist Loaded', icon: 'store' },
                  { step: 3, label: 'Elevator & Transit', icon: 'elevator' },
                  { step: 4, label: 'Arrived at Bed 12', icon: 'map-marker-check' },
                  { step: 5, label: 'Hatch Unlocked', icon: 'lock-open' },
                ].map((s) => {
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <View key={s.step} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIconBubble,
                          {
                            backgroundColor: isDone ? colors.primary : colors.surfaceElevated,
                            borderColor: isDone ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={s.icon as any}
                          size={18}
                          color={isDone ? '#FFFFFF' : colors.textMuted}
                        />
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          {
                            color: isCurrent
                              ? colors.primary
                              : isDone
                              ? colors.textPrimary
                              : colors.textMuted,
                            fontWeight: isCurrent ? '900' : '700',
                          },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Hardware Telemetry Card */}
              <View style={[styles.telemetryCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.telemetryRow}>
                  <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Current Bot Location:</Text>
                  <Text style={[styles.telemetryValue, { color: colors.primary }]}>
                    Floor {currentFloor} • Transit Hallway
                  </Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>LiDAR Obstacle Distance:</Text>
                  <Text style={[styles.telemetryValue, { color: colors.success }]}>
                    {lidar.distanceCm} cm (Path Safe)
                  </Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Estimated Arrival ETA:</Text>
                  <Text style={[styles.telemetryValue, { color: colors.primary }]}>
                    ~2 Minutes to Bed 12
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceElevated }]}>
              <Feather name="clock" size={24} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active medication missions in transit for Bed 12.</Text>
            </View>
          )}
        </View>

        {/* CALL HISTORY */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Call History</Text>
          {myAlerts.length === 0 ? (
            <Text style={[styles.noAlertsText, { color: colors.textSecondary }]}>No previous distress signals today.</Text>
          ) : (
            myAlerts.map((a) => (
              <View key={a.id} style={[styles.alertHistoryItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.historyTop}>
                  <Text style={[styles.historyRecipient, { color: colors.primary }]}>{a.recipient} SUMMON</Text>
                  <Text style={[styles.historyTime, { color: colors.textMuted }]}>{a.timestamp}</Text>
                </View>
                <Text style={[styles.historyReason, { color: colors.textSecondary }]}>{a.reason}</Text>
                <Text style={[styles.historyStatus, { color: a.isResolved ? colors.success : colors.warning }]}>
                  {a.isResolved ? `✓ Attended by ${a.resolvedBy}` : '● Staff Responding'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  envelopeCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  envelopeLeft: {
    flex: 1,
  },
  envelopeBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  envelopeHeading: {
    fontSize: 20,
    fontWeight: '900',
  },
  envelopePatient: {
    fontSize: 12,
    marginTop: 2,
  },
  envelopeDiag: {
    fontSize: 10,
    marginTop: 2,
  },
  envelopeIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginBottom: Spacing.md,
  },
  summonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  summonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summonTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  summonDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  trackerContainer: {
    gap: Spacing.md,
  },
  missionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  missionNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  missionItems: {
    fontSize: 11,
    marginTop: 2,
  },
  stepsFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: '19%',
  },
  stepIconBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 8,
    textAlign: 'center',
  },
  telemetryCard: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    gap: 4,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telemetryLabel: {
    fontSize: 11,
  },
  telemetryValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
  },
  noAlertsText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  alertHistoryItem: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyRecipient: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyTime: {
    fontSize: 10,
  },
  historyReason: {
    fontSize: 11,
    marginVertical: 2,
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
});
