import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OtpModal } from '../../components/delivery/OtpModal';
import { useDeliveryStore, STAGES_FLOW } from '../../stores/useDeliveryStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useRole } from '../../hooks/useRole';
import { DeliveryStage } from '../../types';

export const DeliveryDetailScreen = ({ route, navigation }: any) => {
  const { deliveryId, autoOpenPin } = route?.params || {};
  const { deliveries, activeDeliveryId, advanceDeliveryStage } = useDeliveryStore();
  const { hatchState } = useRobotStore();
  const { isNurse, isChemist, isAdmin } = useRole();

  const currentId = deliveryId || activeDeliveryId;
  const delivery = deliveries.find((d) => d.id === currentId) || deliveries[0];

  const [otpModalVisible, setOtpModalVisible] = useState<boolean>(!!autoOpenPin);

  useEffect(() => {
    if (autoOpenPin) {
      setOtpModalVisible(true);
    }
  }, [autoOpenPin]);

  if (!delivery) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header subtitle="Delivery Mission Tracker" />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>No active delivery found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStageIndex = STAGES_FLOW.indexOf(delivery.status);

  const getStageTitle = (stage: DeliveryStage) => {
    switch (stage) {
      case 'ORDER_PLACED':
        return '1. Order Placed & Prescribed';
      case 'CHEMIST_LOADED':
        return '2. Chemist Compartment Loaded';
      case 'IN_TRANSIT':
        return '3. Transit & Lift Autonomous Navigation';
      case 'ARRIVED_AT_BED':
        return '4. Arrived at Bedside Station';
      case 'PASSCODE_UNLOCKED':
        return '5. SG90 Servo Hatch Unlocked';
      case 'RETURN_TO_DOCK':
        return '6. Return to Autonomous Dock';
    }
  };

  const getStageSubtitle = (stage: DeliveryStage) => {
    switch (stage) {
      case 'ORDER_PLACED':
        return `Requested by ${delivery.prescribedBy} at ${delivery.createdAt}`;
      case 'CHEMIST_LOADED':
        return `Dispensary verified by ${delivery.dispensedBy || 'Rahul Verma'}`;
      case 'IN_TRANSIT':
        return `Traversing Floor ${delivery.currentFloor} Junction ${delivery.currentJunction} to Bed ${delivery.targetBed}`;
      case 'ARRIVED_AT_BED':
        return `Awaiting 4-digit PIN verification at Bed ${delivery.targetBed}`;
      case 'PASSCODE_UNLOCKED':
        return 'SG90 servo hatch opened. Medicine payload retrieved.';
      case 'RETURN_TO_DOCK':
        return 'Mission verified & logged. Robot returning to Base Dock #1.';
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < STAGES_FLOW.length - 1) {
      const next = STAGES_FLOW[currentStageIndex + 1];
      advanceDeliveryStage(delivery.id, next);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle={`Mission: ${delivery.orderNumber}`} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Mission Status Card */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeaderRow}>
            <View style={styles.missionNumberGroup}>
              <StatusBadge
                label={delivery.priority}
                variant={delivery.priority === 'EMERGENCY_STAT' ? 'danger' : 'info'}
                size="sm"
              />
              <Text style={styles.missionNumber}>{delivery.orderNumber}</Text>
            </View>
            <View style={[styles.servoHatchBadge, { borderColor: hatchState === 'UNLOCKED' ? Colors.success : Colors.danger }]}>
              <MaterialCommunityIcons
                name={hatchState === 'UNLOCKED' ? 'lock-open-variant' : 'lock'}
                size={14}
                color={hatchState === 'UNLOCKED' ? Colors.success : Colors.danger}
              />
              <Text style={[styles.servoHatchText, { color: hatchState === 'UNLOCKED' ? Colors.success : Colors.danger }]}>
                SG90: {hatchState}
              </Text>
            </View>
          </View>

          <Text style={styles.destinationTitle}>
            Target: Floor {delivery.targetFloor} • Bed {delivery.targetBed}
          </Text>

          <View style={styles.missionDetailsRow}>
            <View style={styles.detailItem}>
              <Feather name="clock" size={13} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Transit ETA:</Text>
              <Text style={styles.detailValue}>~{delivery.estimatedTransitSeconds}s</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="map-pin" size={13} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>Junction:</Text>
              <Text style={styles.detailValue}>Node {delivery.currentJunction}</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="key" size={13} color={Colors.primary} />
              <Text style={styles.detailLabel}>Passcode:</Text>
              <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: '700' }]}>
                {delivery.passcode}
              </Text>
            </View>
          </View>

          {/* Action Trigger Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.openOtpBtn}
              onPress={() => setOtpModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="shield-key" size={18} color={Colors.textInverted} />
              <Text style={styles.openOtpBtnText}>Enter 4-Digit Unlock PIN</Text>
            </TouchableOpacity>

            {(isNurse || isChemist || isAdmin) && (
              <TouchableOpacity
                style={styles.advanceStageBtn}
                onPress={handleNextStage}
                activeOpacity={0.8}
              >
                <Feather name="fast-forward" size={16} color={Colors.primary} />
                <Text style={styles.advanceStageBtnText}>Advance Stage</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 6-STAGE PROGRESSION TRACKER */}
        <View style={styles.stagesCard}>
          <Text style={styles.stagesSectionTitle}>6-Stage Autonomous Lifecycle</Text>

          {STAGES_FLOW.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            const isPending = currentStageIndex < idx;

            return (
              <View key={stage} style={styles.stageStepRow}>
                {/* Stage timeline line and dot */}
                <View style={styles.stepIndicatorColumn}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isCurrent && styles.stepDotCurrent,
                      isPending && styles.stepDotPending,
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={12} color={Colors.textInverted} />
                    ) : isCurrent ? (
                      <View style={styles.currentInnerDot} />
                    ) : (
                      <Text style={styles.stepNumText}>{idx + 1}</Text>
                    )}
                  </View>
                  {idx < STAGES_FLOW.length - 1 && (
                    <View
                      style={[
                        styles.stepConnectorLine,
                        isCompleted && styles.stepConnectorLineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Stage text content */}
                <View style={styles.stepContentBox}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitleText,
                        isCurrent && { color: Colors.primary, fontWeight: '700' },
                        isCompleted && { color: Colors.textPrimary },
                        isPending && { color: Colors.textMuted },
                      ]}
                    >
                      {getStageTitle(stage)}
                    </Text>
                    {isCurrent && (
                      <StatusBadge label="ACTIVE" variant="primary" size="sm" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepSubtitleText,
                      isPending && { color: Colors.textMuted },
                    ]}
                  >
                    {getStageSubtitle(stage)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Payload Contents Card */}
        <View style={styles.payloadCard}>
          <View style={styles.payloadHeader}>
            <MaterialCommunityIcons name="pill" size={20} color={Colors.primary} />
            <Text style={styles.payloadTitle}>Secure Compartment Payload</Text>
          </View>

          {delivery.items.map((item, i) => (
            <View key={i} style={styles.payloadItemRow}>
              <View>
                <Text style={styles.payloadItemName}>{item.drug.name}</Text>
                <Text style={styles.payloadItemDosage}>{item.drug.dosage}</Text>
              </View>
              <Text style={styles.payloadItemQty}>
                Qty: {item.quantity} {item.drug.unit}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 4-Digit PIN Modal for SG90 Servo Actuation */}
      <OtpModal
        visible={otpModalVisible}
        deliveryId={delivery.id}
        expectedPin={delivery.passcode}
        onClose={() => setOtpModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 110,
  },
  notFoundContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  notFoundText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  missionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  missionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  missionNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  missionNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
  },
  servoHatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  servoHatchText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  destinationTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  missionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  openOtpBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
  },
  openOtpBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverted,
  },
  advanceStageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.bgDark,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  advanceStageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stagesCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  stagesSectionTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stageStepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: Spacing.sm,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepDotCurrent: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  currentInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  stepDotPending: {
    backgroundColor: Colors.bgDark,
    borderColor: Colors.border,
  },
  stepNumText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  stepConnectorLine: {
    width: 2,
    height: 28,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  stepConnectorLineCompleted: {
    backgroundColor: Colors.success,
  },
  stepContentBox: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepSubtitleText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  payloadCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  payloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  payloadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  payloadItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgSurfaceLight,
  },
  payloadItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  payloadItemDosage: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  payloadItemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
