import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { AlertRecipient, AlertSeverity } from '../../types';

export const CallingMatrixScreen = () => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuthStore();
  const { alerts, triggerAlert, resolveAlert } = useCallingMatrixStore();
  const isPatient = currentUser.role === 'PATIENT';
  const patientBed = currentUser.assignedBed || 12;
  const patientFloor = currentUser.allocatedFloor || Math.ceil(patientBed / 10);

  const [selectedBed, setSelectedBed] = useState<number>(isPatient ? patientBed : 12);
  const [selectedFloor, setSelectedFloor] = useState<number>(
    isPatient ? patientFloor : Math.ceil(selectedBed / 10) || 2
  );
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  // 10 beds for active floor
  const floorBeds = Array.from({ length: 10 }, (_, i) => (selectedFloor - 1) * 10 + i + 1);

  const handleSelectFloor = (f: number) => {
    setSelectedFloor(f);
    const minBed = (f - 1) * 10 + 1;
    const maxBed = f * 10;
    if (selectedBed < minBed || selectedBed > maxBed) {
      setSelectedBed(minBed);
    }
  };

  // Filter alerts: Patients see ONLY their own bed; Staff sees all facility alerts
  const visibleAlerts = isPatient
    ? alerts.filter((a) => a.bedNumber === patientBed)
    : alerts;

  const handleDispatchAlert = (recipient: AlertRecipient, severity: AlertSeverity, reason: string) => {
    const targetBed = isPatient ? patientBed : selectedBed;
    const floor = isPatient ? patientFloor : Math.ceil(targetBed / 10);

    const created = triggerAlert({
      bedNumber: targetBed,
      floor,
      recipient,
      severity,
      patientName: isPatient ? currentUser.name : `Bed ${targetBed} Inpatient`,
      reason,
    });

    setLastDispatched(
      `DISPATCHED TO ${recipient} (Floor ${floor} / Bed ${targetBed}): "${reason}" [${created.timestamp}]`
    );

    setTimeout(() => {
      setLastDispatched(null);
    }, 5000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        subtitle={
          isPatient
            ? `Bedside Intercom • Floor ${patientFloor} / Bed ${patientBed}`
            : 'Emergency & Nursing Assistance Matrix'
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PATIENT VIEW: Locked exclusively to their allocated bed */}
        {isPatient ? (
          <View style={[styles.patientLocCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.patientLocBadge, { color: colors.primary }]}>YOUR ALLOCATED INPATIENT ROOM</Text>
              <Text style={[styles.patientLocHeading, { color: colors.textPrimary }]}>
                Floor {patientFloor} • Bed {patientBed}
              </Text>
              <Text style={[styles.patientLocSub, { color: colors.textSecondary }]}>
                Patient: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{currentUser.name}</Text>
              </Text>
            </View>
            <View style={[styles.patientLocIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 32 }}>🏥</Text>
            </View>
          </View>
        ) : (
          /* STAFF/ADMIN VIEW: Facility-wide Bed Location Selector with Floor Filter */
          <View style={[styles.selectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.selectionTitleRow}>
              <MaterialCommunityIcons name="hospital-building" size={20} color={colors.primary} />
              <Text style={[styles.selectionCardTitle, { color: colors.textPrimary }]}>
                Bed Location Selector (Facility Beds 1 - 50)
              </Text>
            </View>
            <Text style={[styles.selectionCardSub, { color: colors.textSecondary }]}>
              Selected Bed: <Text style={[styles.highlightBed, { color: colors.primary }]}>Bed {selectedBed}</Text> (Floor {selectedFloor})
            </Text>

            {/* Step 1: Select Floor */}
            <Text style={[styles.stepLabel, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Step 1: Select Floor (1 - 5)
            </Text>
            <View style={styles.floorButtonsRow}>
              {[1, 2, 3, 4, 5].map((f) => {
                const isActive = selectedFloor === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.floorBtn,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surfaceElevated,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectFloor(f)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.floorBtnText,
                        { color: isActive ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      Floor {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Step 2: Select Bed within Floor */}
            <Text style={[styles.stepLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              Step 2: Target Bed (Floor {selectedFloor} Beds)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bedScroll}>
              {floorBeds.map((b) => {
                const isSelected = selectedBed === b;
                const hasActiveAlert = alerts.some((a) => a.bedNumber === b && !a.isResolved);
                return (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.bedChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : hasActiveAlert ? colors.danger : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedBed(b)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.bedChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : hasActiveAlert
                            ? colors.danger
                            : colors.textPrimary,
                        },
                      ]}
                    >
                      Bed {b}
                    </Text>
                    {hasActiveAlert && <View style={[styles.alertDot, { backgroundColor: colors.danger }]} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Dispatch Confirmation Banner */}
        {lastDispatched && (
          <View style={[styles.dispatchBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
            <Feather name="bell" size={16} color={colors.success} />
            <Text style={[styles.dispatchBannerText, { color: colors.success }]}>{lastDispatched}</Text>
          </View>
        )}

        {/* PRIMARY NEED HELP BUTTON (for Patients) */}
        {isPatient && (
          <View
            style={[
              styles.intercomHelpBox,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
                borderColor: isDark ? '#EF4444' : '#DC2626',
              },
            ]}
          >
            <Text style={[styles.intercomHelpTitle, { color: isDark ? '#EF4444' : '#DC2626' }]}>
              INTERCOM EMERGENCY SIGNALING
            </Text>
            <Text style={[styles.intercomHelpSub, { color: colors.textSecondary }]}>
              Tap below to broadcast an instant emergency help alert directly to all duty nurses and medical stations.
            </Text>
            <TouchableOpacity
              style={[
                styles.bigNeedHelpBtn,
                { backgroundColor: isDark ? '#EF4444' : '#DC2626' },
              ]}
              onPress={() =>
                handleDispatchAlert(
                  'NURSE',
                  'CODE_RED',
                  `EMERGENCY HELP REQUEST: Patient in Floor ${patientFloor} / Bed ${patientBed} needs immediate assistance!`
                )
              }
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="alert-decagram" size={28} color="#FFFFFF" />
              <Text style={styles.bigNeedHelpBtnText}>⚠️ BROADCAST CODE RED / STAT</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3 Urgent Dispatch Buttons: Doctor / Nurse / Peon */}
        <View style={styles.dispatchSection}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>
            {isPatient ? 'Specific Assistance Request' : 'Instant One-Touch Dispatch Action'}
          </Text>

          {/* CODE RED: Doctor */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
                borderColor: isDark ? '#EF4444' : '#DC2626',
              },
            ]}
            onPress={() =>
              handleDispatchAlert(
                'DOCTOR',
                'CODE_RED',
                'Critical Patient Emergency / Acute Distress (Immediate Physician Required)'
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2' }]}>
              <MaterialCommunityIcons name="alarm-light" size={28} color={isDark ? '#EF4444' : '#DC2626'} />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>DOCTOR • CODE RED</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                Acute emergency, resuscitation, sudden desaturation or cardiac arrest
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#EF4444' : '#DC2626'} />
          </TouchableOpacity>

          {/* NURSE ASSISTANCE */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.14)' : '#FFFBEB',
                borderColor: isDark ? '#F59E0B' : '#D97706',
              },
            ]}
            onPress={() =>
              handleDispatchAlert(
                'NURSE',
                'ASSISTANCE',
                'Nursing Assistance / IV Line Check / Medication Query'
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7' }]}>
              <MaterialCommunityIcons name="doctor" size={28} color={isDark ? '#FBBF24' : '#D97706'} />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>NURSE • ASSISTANCE</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                IV cannula alarm, pain medication request, dressing assistance
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
          </TouchableOpacity>

          {/* PEON / ORDERLY */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? 'rgba(2, 132, 199, 0.14)' : '#F0F9FF',
                borderColor: isDark ? '#38BDF8' : '#0284C7',
              },
            ]}
            onPress={() =>
              handleDispatchAlert(
                'PEON',
                'SERVICE',
                'Water Bottle Refill, Clean Linen, or Physical Assistance'
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.25)' : '#E0F2FE' }]}>
              <MaterialCommunityIcons name="water-pump" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>PEON • ORDERLY SERVICE</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                Drinking water refill, spills, linen change, or room logistics
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Emergency Calls Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>
              {isPatient
                ? `Call History (Bed ${patientBed} Only)`
                : `Facility Emergency Alert Feed (${visibleAlerts.length})`}
            </Text>
            {!isPatient && (
              <Text style={[styles.feedCountText, { color: colors.primary }]}>
                {visibleAlerts.filter((a) => !a.isResolved).length} Pending
              </Text>
            )}
          </View>

          {visibleAlerts.length === 0 ? (
            <View style={[styles.emptyFeedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="check-circle" size={32} color={colors.success} />
              <Text style={[styles.emptyFeedTitle, { color: colors.textPrimary }]}>No Active Distress Signals</Text>
              <Text style={[styles.emptyFeedSub, { color: colors.textSecondary }]}>
                {isPatient
                  ? 'All calls for your bed have been answered and resolved.'
                  : 'All facility wards operating normally.'}
              </Text>
            </View>
          ) : (
            visibleAlerts.map((item) => (
              <View key={item.id} style={[styles.alertItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.alertItemTop}>
                  <View style={styles.badgeRow}>
                    <StatusBadge
                      label={item.recipient}
                      variant={
                        item.recipient === 'DOCTOR'
                          ? 'danger'
                          : item.recipient === 'NURSE'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    />
                    <Text style={[styles.alertBedNum, { color: colors.textPrimary }]}>
                      Floor {item.floor} • Bed {item.bedNumber}
                    </Text>
                  </View>
                  <Text style={[styles.alertTime, { color: colors.textMuted }]}>{item.timestamp}</Text>
                </View>

                <Text style={[styles.alertPatientName, { color: colors.primary }]}>Patient: {item.patientName}</Text>
                <Text style={[styles.alertReason, { color: colors.textSecondary }]}>{item.reason}</Text>

                <View style={styles.alertBottomRow}>
                  {item.isResolved ? (
                    <View style={styles.resolvedBadge}>
                      <Feather name="check" size={13} color={colors.success} />
                      <Text style={[styles.resolvedText, { color: colors.success }]}>
                        Resolved at {item.resolvedAt} by {item.resolvedBy}
                      </Text>
                    </View>
                  ) : !isPatient ? (
                    <TouchableOpacity
                      style={[styles.resolveActionBtn, { backgroundColor: colors.primary }]}
                      onPress={() => resolveAlert(item.id, currentUser.name)}
                    >
                      <Feather name="check-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.resolveActionText}>Acknowledge & Resolve</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.pendingBadge, { backgroundColor: colors.warningLight }]}>
                      <Feather name="clock" size={13} color={colors.warning} />
                      <Text style={[styles.pendingText, { color: colors.warning }]}>Broadcasted • Awaiting Staff Response</Text>
                    </View>
                  )}
                </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 110,
  },
  selectionCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  selectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectionCardSub: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  highlightBed: {
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  floorButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  floorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bedScroll: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  bedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bedChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dispatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  dispatchBannerText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  patientLocCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  patientLocBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  patientLocHeading: {
    fontSize: 20,
    fontWeight: '800',
  },
  patientLocSub: {
    fontSize: 11,
    marginTop: 3,
  },
  patientLocIconCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intercomHelpBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  intercomHelpTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  intercomHelpSub: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },
  bigNeedHelpBtn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  bigNeedHelpBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dispatchSection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  actionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  feedSection: {
    marginTop: Spacing.xs,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  feedCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyFeedCard: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyFeedTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptyFeedSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  alertItemCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  alertItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertBedNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertTime: {
    fontSize: 11,
  },
  alertPatientName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  alertReason: {
    fontSize: 12,
    marginVertical: 4,
  },
  alertBottomRow: {
    marginTop: Spacing.xs,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resolvedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resolveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  resolveActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
