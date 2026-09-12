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
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useRobotStore } from '../../stores/useRobotStore';

export const BatteryScreen = () => {
  const { power, setRobotStatus } = useRobotStore();

  const isBatteryLow = power.batteryPercentage < 25;
  const cell1 = +(power.batteryVoltage / 2).toFixed(2);
  const cell2 = +(power.batteryVoltage - cell1).toFixed(2);

  const handleReturnToDock = () => {
    setRobotStatus('RETURNING');
    console.log('[MQTT: medibot/power/dock] -> { "command": "RETURN_TO_DOCK_CHARGING", "reason": "BATTERY_MANUAL" }');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Li-ion 18650 Pack & LM2596 Step-Down Rail" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Battery Status Card */}
        <View style={styles.mainBatteryCard}>
          <View style={styles.topRow}>
            <View style={styles.titleGroup}>
              <MaterialCommunityIcons name="battery-high" size={28} color={Colors.success} />
              <View>
                <Text style={styles.packTitle}>7.4V Nominal 2S 18650 Li-ion Pack</Text>
                <Text style={styles.packSubtitle}>Panasonic NCR18650B • 3400mAh High Drain</Text>
              </View>
            </View>
            <StatusBadge
              label={power.chargingState}
              variant={power.chargingState === 'CHARGING' ? 'success' : 'primary'}
            />
          </View>

          {/* Large Battery Gauge */}
          <View style={styles.gaugeContainer}>
            <Text style={styles.gaugePercent}>{power.batteryPercentage}%</Text>
            <Text style={styles.gaugeVoltage}>{power.batteryVoltage} VDC</Text>
          </View>

          {/* Battery Bar */}
          <View style={styles.batteryTrack}>
            <View
              style={[
                styles.batteryFill,
                {
                  width: `${power.batteryPercentage}%`,
                  backgroundColor: isBatteryLow ? Colors.danger : power.batteryPercentage < 50 ? Colors.warning : Colors.success,
                },
              ]}
            />
          </View>

          <View style={styles.runtimeSummaryRow}>
            <View style={styles.runtimeItem}>
              <Feather name="clock" size={14} color={Colors.textSecondary} />
              <Text style={styles.runtimeLabel}>Runtime Remaining:</Text>
              <Text style={styles.runtimeValue}>~{(power.estimatedRuntimeMinutes / 60).toFixed(1)} hrs</Text>
            </View>
            <View style={styles.runtimeItem}>
              <Feather name="activity" size={14} color={Colors.textSecondary} />
              <Text style={styles.runtimeLabel}>Current Draw:</Text>
              <Text style={styles.runtimeValue}>1.42 A</Text>
            </View>
          </View>
        </View>

        {/* Dual Cell Balance Telemetry */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2S Balance BMS Diagnostics</Text>
          <View style={styles.cellsRow}>
            <View style={styles.cellBox}>
              <MaterialCommunityIcons name="battery-outline" size={20} color={Colors.primary} />
              <Text style={styles.cellLabel}>Cell 1 Voltage</Text>
              <Text style={styles.cellVolts}>{cell1} V</Text>
              <Text style={styles.cellStatus}>Delta: 0.00V (OK)</Text>
            </View>
            <View style={styles.cellBox}>
              <MaterialCommunityIcons name="battery-outline" size={20} color={Colors.primary} />
              <Text style={styles.cellLabel}>Cell 2 Voltage</Text>
              <Text style={styles.cellVolts}>{cell2} V</Text>
              <Text style={styles.cellStatus}>Delta: 0.00V (OK)</Text>
            </View>
          </View>
        </View>

        {/* LM2596 Step-Down Voltage Regulator Card */}
        <View style={styles.card}>
          <View style={styles.regulatorHeader}>
            <MaterialCommunityIcons name="chip" size={22} color={Colors.warning} />
            <Text style={styles.cardTitle}>LM2596 Step-Down Buck Converter (5.0V Rail)</Text>
          </View>
          <Text style={styles.regulatorDesc}>
            Feeds regulated 5V power to ESP32 microcontroller, SG90 servo deadbolt, and TF-Luna LiDAR.
          </Text>

          <View style={styles.regulatorMetrics}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Buck 5V Output"
                value={power.stepDownRail5V}
                unit="V"
                badgeLabel={power.isRailNormal ? 'STABLE' : 'UNSTABLE'}
                badgeVariant={power.isRailNormal ? 'success' : 'danger'}
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="BMS Heat Sink"
                value="34.2"
                unit="°C"
                badgeLabel="NORMAL"
                badgeVariant="success"
              />
            </View>
          </View>
        </View>

        {/* Return to Base Dock Button */}
        <TouchableOpacity
          style={styles.dockBtn}
          onPress={handleReturnToDock}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="ev-station" size={20} color={Colors.textInverted} />
          <Text style={styles.dockBtnText}>Order MediBot to Base Dock #1 (Recharge)</Text>
        </TouchableOpacity>
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
  mainBatteryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  packTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  packSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  gaugePercent: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  gaugeVoltage: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  batteryTrack: {
    height: 14,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  batteryFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  runtimeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  runtimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  runtimeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  runtimeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cellsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cellBox: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  cellLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cellVolts: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  cellStatus: {
    fontSize: 10,
    color: Colors.success,
  },
  regulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  regulatorDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  regulatorMetrics: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  dockBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textInverted,
  },
});
