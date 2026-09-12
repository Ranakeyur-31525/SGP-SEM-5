import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { IrSensorState } from '../../types';

interface FloorMap2DProps {
  currentFloor: number;
  currentJunction: number;
  targetBed: number;
  irArray: IrSensorState;
  robotStatus: string;
}

export const FloorMap2D: React.FC<FloorMap2DProps> = ({
  currentFloor,
  currentJunction,
  targetBed,
  irArray,
  robotStatus,
}) => {
  // Junction nodes from 0 (Charging Dock) to 10 (End corridor Ward)
  const junctions = Array.from({ length: 11 }, (_, i) => i);

  // Approximate bed mapping: e.g. Floor 3 has Beds 21-30, Floor 1 has Beds 1-10, etc.
  const bedsOnThisFloor = Array.from({ length: 10 }, (_, i) => (currentFloor - 1) * 10 + i + 1);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="floor-plan" size={20} color={Colors.primary} />
          <Text style={styles.headerTitle}>2D Autonomous Nav Grid (Floor {currentFloor})</Text>
        </View>
        <View style={styles.floorBadge}>
          <Text style={styles.floorBadgeText}>Junction: {currentJunction}/10</Text>
        </View>
      </View>

      {/* Top Infrastructure Row: Lift Node & Charging Dock */}
      <View style={styles.infraRow}>
        <View style={styles.infraBox}>
          <MaterialCommunityIcons name="elevator-passenger" size={18} color={Colors.info} />
          <Text style={styles.infraText}>IoT Lift Shaft</Text>
          <View style={[styles.statusDot, { backgroundColor: currentJunction <= 1 ? Colors.success : Colors.textMuted }]} />
        </View>

        <View style={styles.infraBox}>
          <MaterialCommunityIcons name="ev-station" size={18} color={Colors.warning} />
          <Text style={styles.infraText}>Base Dock #1</Text>
          <View style={[styles.statusDot, { backgroundColor: currentJunction === 0 ? Colors.primary : Colors.textMuted }]} />
        </View>

        <View style={[styles.infraBox, { borderColor: Colors.primaryDark }]}>
          <MaterialCommunityIcons name="bed" size={18} color={Colors.primary} />
          <Text style={styles.infraText}>Target: Bed {targetBed}</Text>
          <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
        </View>
      </View>

      {/* 2D Line & Junction Track Visualizer */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll}>
        <View style={styles.trackContainer}>
          {/* Main IR Guideway Line */}
          <View style={styles.blackGuidewayLine} />

          {/* Junction Nodes along the corridor */}
          {junctions.map((j) => {
            const isRobotHere = currentJunction === j;
            const isDock = j === 0;
            const isTargetJunction = j === (targetBed % 10 || 10);

            return (
              <View key={j} style={styles.junctionNodeWrapper}>
                {/* Upper Bed / Room link */}
                <View
                  style={[
                    styles.bedRoomNode,
                    isTargetJunction && styles.targetBedRoomNode,
                  ]}
                >
                  <Text style={[styles.bedRoomText, isTargetJunction && { color: Colors.primary }]}>
                    B{bedsOnThisFloor[Math.min(j, 9)]}
                  </Text>
                </View>

                {/* Vertical spur track */}
                <View style={styles.spurLine} />

                {/* Junction point on line */}
                <View
                  style={[
                    styles.junctionCircle,
                    isRobotHere && styles.junctionRobotPresent,
                    isDock && styles.junctionDock,
                  ]}
                >
                  {isRobotHere ? (
                    <MaterialCommunityIcons name="robot" size={16} color={Colors.bgDark} />
                  ) : (
                    <Text style={styles.junctionNumber}>{j}</Text>
                  )}
                </View>

                {/* Node Label */}
                <Text style={styles.junctionLabel}>
                  {isDock ? 'Dock' : `J-${j}`}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 5-Channel IR Line Tracker Telemetry Bar */}
      <View style={styles.irSection}>
        <View style={styles.irTitleRow}>
          <Text style={styles.irTitle}>5-Channel IR Array (Line / Node Detector)</Text>
          <Text style={[styles.irNodeBadge, { color: irArray.onNodeJunction ? Colors.primary : Colors.textMuted }]}>
            {irArray.onNodeJunction ? '★ JUNCTION NODE DETECTED' : 'LINE TRACKING'}
          </Text>
        </View>

        <View style={styles.irSensorRow}>
          {['L2 (Outer)', 'L1 (Inner)', 'C (Center)', 'R1 (Inner)', 'R2 (Outer)'].map((label, idx) => {
            const isActive = irArray.sensors[idx];
            return (
              <View key={idx} style={styles.sensorItem}>
                <View
                  style={[
                    styles.sensorLed,
                    {
                      backgroundColor: isActive ? Colors.primary : Colors.bgDark,
                      borderColor: isActive ? Colors.primaryLight : Colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sensorBitText, { color: isActive ? Colors.bgDark : Colors.textMuted }]}>
                    {isActive ? '1' : '0'}
                  </Text>
                </View>
                <Text style={styles.sensorLabel}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  floorBadge: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floorBadgeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  infraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infraBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.bgDark,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  infraText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trackScroll: {
    marginVertical: Spacing.xs,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    position: 'relative',
    height: 130,
  },
  blackGuidewayLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    height: 6,
    backgroundColor: '#050B17',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 3,
  },
  junctionNodeWrapper: {
    alignItems: 'center',
    width: 64,
  },
  bedRoomNode: {
    width: 44,
    height: 24,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetBedRoomNode: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
  },
  bedRoomText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  spurLine: {
    width: 2,
    height: 14,
    backgroundColor: Colors.border,
  },
  junctionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgCardSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  junctionRobotPresent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.textPrimary,
    transform: [{ scale: 1.2 }],
  },
  junctionDock: {
    borderColor: Colors.warning,
  },
  junctionNumber: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  junctionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  irSection: {
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  irTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  irTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  irNodeBadge: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  irSensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  sensorItem: {
    flex: 1,
    alignItems: 'center',
  },
  sensorLed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 2,
  },
  sensorBitText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  sensorLabel: {
    fontSize: 9,
    color: Colors.textMuted,
  },
});
