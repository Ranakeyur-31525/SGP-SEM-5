import React from 'react';
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
import { MetricCard } from '../../components/common/MetricCard';
import { useRobotStore } from '../../stores/useRobotStore';

export const ElevatorControlScreen = () => {
  const { lift, currentFloor, commandLift } = useRobotStore();

  const isLiftActive = lift.relayState === 'ACTIVE' || lift.relayState === 'CALLED';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Multi-Floor IoT Lift Relay Node Monitor" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Elevator Shaft Visualization */}
        <View style={styles.shaftCard}>
          <View style={styles.shaftHeader}>
            <View style={styles.shaftTitleGroup}>
              <MaterialCommunityIcons name="elevator-passenger" size={24} color={Colors.primary} />
              <Text style={styles.shaftTitle}>Hospital Lift Shaft Interface (Floors 1 - 5)</Text>
            </View>
            <StatusBadge
              label={lift.relayState}
              variant={isLiftActive ? 'warning' : lift.relayState === 'ARRIVED' ? 'success' : 'info'}
              size="sm"
            />
          </View>

          {/* Vertical 5-Floor Shaft Indicator */}
          <View style={styles.floorsColumn}>
            {[5, 4, 3, 2, 1].map((f) => {
              const isRobotFloor = currentFloor === f;
              const isLiftCarHere = lift.currentLiftFloor === f;
              const isTargetFloor = lift.targetFloor === f;

              return (
                <View key={f} style={[styles.floorRow, isTargetFloor && styles.floorRowTarget]}>
                  {/* Floor Label */}
                  <View style={styles.floorLabelBox}>
                    <Text style={styles.floorNumText}>FL-{f}</Text>
                    <Text style={styles.floorWardDesc}>
                      {f === 5 ? 'ICU / OT' : f === 4 ? 'Post-Op' : f === 3 ? 'Cardiology' : f === 2 ? 'General' : 'Pharmacy/Dock'}
                    </Text>
                  </View>

                  {/* Shaft Center Channel */}
                  <View style={styles.shaftChannel}>
                    {isLiftCarHere ? (
                      <View style={styles.liftCar}>
                        <MaterialCommunityIcons
                          name="elevator"
                          size={18}
                          color={Colors.textInverted}
                        />
                        <Text style={styles.liftCarText}>CAR</Text>
                      </View>
                    ) : (
                      <View style={styles.shaftDottedLine} />
                    )}
                  </View>

                  {/* Robot Position Marker */}
                  <View style={styles.robotMarkerBox}>
                    {isRobotFloor ? (
                      <View style={styles.robotPill}>
                        <MaterialCommunityIcons name="robot" size={14} color={Colors.primary} />
                        <Text style={styles.robotPillText}>MediBot</Text>
                      </View>
                    ) : (
                      <Text style={styles.emptySlotText}>—</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Optocoupler Relay & Telemetry Diagnostics */}
        <View style={styles.telemetryGrid}>
          <View style={styles.metricHalf}>
            <MetricCard
              title="Optocoupler Relay"
              value={lift.relayState}
              badgeLabel="ISOLATED"
              badgeVariant="success"
              icon={<MaterialCommunityIcons name="transit-connection" size={16} color={Colors.warning} />}
            />
          </View>
          <View style={styles.metricHalf}>
            <MetricCard
              title="Shaft Door Status"
              value={lift.doorStatus}
              badgeLabel={lift.doorStatus === 'OPEN' ? 'SAFE' : 'LOCKED'}
              badgeVariant={lift.doorStatus === 'OPEN' ? 'success' : 'info'}
              icon={<MaterialCommunityIcons name="door-sliding" size={16} color={Colors.primary} />}
            />
          </View>
        </View>

        {/* Manual Lift Floor Dispatch Trigger */}
        <View style={styles.dispatchCard}>
          <Text style={styles.dispatchTitle}>Trigger Autonomous Lift Call (ESP32 IoT)</Text>
          <Text style={styles.dispatchSubtitle}>
            Sends MQTT command to elevator controller optocoupler to summon car:
          </Text>

          <View style={styles.floorButtonsRow}>
            {[1, 2, 3, 4, 5].map((target) => (
              <TouchableOpacity
                key={target}
                style={[
                  styles.callFloorBtn,
                  lift.targetFloor === target && styles.callFloorBtnActive,
                ]}
                onPress={() => commandLift(target)}
                disabled={isLiftActive}
              >
                <Text
                  style={[
                    styles.callFloorBtnText,
                    lift.targetFloor === target && styles.callFloorBtnTextActive,
                  ]}
                >
                  Floor {target}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MQTT Payload Stream Card */}
        <View style={styles.mqttPayloadCard}>
          <View style={styles.mqttHeader}>
            <Feather name="terminal" size={15} color={Colors.primary} />
            <Text style={styles.mqttTitle}>Live IoT Protocol Payload (medibot/lift/command)</Text>
          </View>
          <Text style={styles.mqttCode}>
            {`{\n  "targetFloor": ${lift.targetFloor},\n  "relayState": "${lift.relayState}",\n  "currentLiftFloor": ${lift.currentLiftFloor},\n  "doorStatus": "${lift.doorStatus}",\n  "hardware": "ESP32-Optocoupler-Node-04"\n}`}
          </Text>
        </View>
      </ScrollView>
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
  shaftCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  shaftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shaftTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  shaftTitle: {
    ...Typography.titleSmall,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  floorsColumn: {
    gap: Spacing.xs,
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  floorRowTarget: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.bgCardSecondary,
  },
  floorLabelBox: {
    width: 90,
  },
  floorNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  floorWardDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  shaftChannel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  shaftDottedLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.border,
  },
  liftCar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  liftCarText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textInverted,
  },
  robotMarkerBox: {
    width: 90,
    alignItems: 'flex-end',
  },
  robotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  robotPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptySlotText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricHalf: {
    flex: 1,
  },
  dispatchCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  dispatchTitle: {
    ...Typography.titleSmall,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dispatchSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  floorButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  callFloorBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  callFloorBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  callFloorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  callFloorBtnTextActive: {
    color: Colors.textInverted,
  },
  mqttPayloadCard: {
    backgroundColor: '#050B17',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mqttHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  mqttTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  mqttCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
    lineHeight: 18,
  },
});
