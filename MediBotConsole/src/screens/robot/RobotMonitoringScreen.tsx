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
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';

export const RobotMonitoringScreen = () => {
  const { colors } = useTheme();
  const {
    robotId,
    status,
    currentFloor,
    targetBed,
    lidar,
    power,
    emergencyStop,
    hatchState,
    triggerEmergencyStop,
    resetEmergencyStop,
    setManualLidarDistance,
    setFloorAndJunction,
  } = useRobotStore();

  const [showTechnical, setShowTechnical] = useState<boolean>(false);

  // Status computation
  const isHalted = emergencyStop || lidar.brakeEngaged;
  const isWarning = !isHalted && lidar.distanceCm <= 100;
  const isSafe = !isHalted && lidar.distanceCm > 100;

  const getStatusInfo = () => {
    if (emergencyStop) {
      return {
        label: 'EMERGENCY STOPPED',
        sub: 'Robot is halted manually by staff button.',
        color: colors.danger,
        bg: colors.dangerLight,
        icon: 'alert-octagon',
      };
    }
    if (lidar.brakeEngaged) {
      return {
        label: 'OBSTACLE DETECTED (HALTED)',
        sub: `Object is only ${lidar.distanceCm} cm away. Safety brake is automatically locked.`,
        color: colors.danger,
        bg: colors.dangerLight,
        icon: 'alert-triangle',
      };
    }
    if (isWarning) {
      return {
        label: 'APPROACHING OBSTACLE (SLOW)',
        sub: `Object detected at ${lidar.distanceCm} cm. Robot is reducing speed for safety.`,
        color: colors.warning,
        bg: colors.warningLight,
        icon: 'alert-circle',
      };
    }
    return {
      label: 'PATH IS CLEAR (NORMAL SPEED)',
      sub: `No obstacles detected within 100cm. Current clearance: ${lidar.distanceCm} cm.`,
      color: colors.success,
      bg: colors.successLight,
      icon: 'check-circle',
    };
  };

  const statusInfo = getStatusInfo();

  const handleSimulateDistance = (cm: number) => {
    setManualLidarDistance(cm);
  };

  const handleFloorChange = (floor: number) => {
    setFloorAndJunction(floor, 0);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgDark }]}>
      <Header title="Fleet Safety Radar" subtitle="Live robot sensor telemetry & navigation" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. ROBOT QUICK STATUS OVERVIEW */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.robotIdentity}>
              <View style={[styles.robotIconBox, { backgroundColor: colors.primaryLight }]}>
                <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.robotName, { color: colors.textPrimary }]}>{robotId}</Text>
                <Text style={[styles.robotSub, { color: colors.textMuted }]}>Autonomous Rover #01</Text>
              </View>
            </View>

            <View
              style={[
                styles.livePill,
                {
                  backgroundColor: emergencyStop ? colors.dangerLight : colors.successLight,
                  borderColor: emergencyStop ? colors.danger : colors.success,
                },
              ]}
            >
              <View
                style={[
                  styles.pulsingDot,
                  { backgroundColor: emergencyStop ? colors.danger : colors.success },
                ]}
              />
              <Text
                style={[
                  styles.livePillText,
                  { color: emergencyStop ? colors.danger : colors.success },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statCell}>
              <Text style={[styles.statCellTitle, { color: colors.primary }]}>Floor {currentFloor}</Text>
              <Text style={[styles.statCellSub, { color: colors.textMuted }]}>Current Level</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statCell}>
              <Text style={[styles.statCellTitle, { color: colors.textPrimary }]}>Bed #{targetBed}</Text>
              <Text style={[styles.statCellSub, { color: colors.textMuted }]}>Destination</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statCell}>
              <Text style={[styles.statCellTitle, { color: colors.success }]}>
                {power.batteryPercentage}% ({power.batteryVoltage}V)
              </Text>
              <Text style={[styles.statCellSub, { color: colors.textMuted }]}>Battery</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statCell}>
              <Text
                style={[
                  styles.statCellTitle,
                  { color: hatchState === 'UNLOCKED' ? colors.success : colors.warning },
                ]}
              >
                {hatchState}
              </Text>
              <Text style={[styles.statCellSub, { color: colors.textMuted }]}>Medicine Hatch</Text>
            </View>
          </View>
        </View>

        {/* 2. FRONT OBSTACLE RADAR (SUPER SIMPLE & INTUITIVE) */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="radar" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Front Safety Radar (LiDAR)
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                Real-time distance to objects in front of the vehicle
              </Text>
            </View>
          </View>

          {/* Big Proximity Hero Box */}
          <View
            style={[
              styles.proximityHeroBox,
              { backgroundColor: statusInfo.bg, borderColor: statusInfo.color },
            ]}
          >
            <Feather name={statusInfo.icon as any} size={36} color={statusInfo.color} />
            <View style={{ flex: 1 }}>
              <View style={styles.distanceRow}>
                <Text style={[styles.distanceHeroNumber, { color: statusInfo.color }]}>
                  {lidar.distanceCm}
                </Text>
                <Text style={[styles.distanceHeroUnit, { color: statusInfo.color }]}>cm</Text>
                <View
                  style={[
                    styles.statusBadgeInline,
                    { backgroundColor: statusInfo.color },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {isHalted ? 'HALTED' : isWarning ? 'SLOWING' : 'CLEAR'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.distanceExplanation, { color: colors.textPrimary }]}>
                {statusInfo.sub}
              </Text>
            </View>
          </View>

          {/* Safe / Warning / Danger Zones Bar */}
          <Text style={[styles.meterTitle, { color: colors.textSecondary }]}>
            Proximity Thresholds:
          </Text>
          <View style={styles.meterTrack}>
            <View style={[styles.meterZone, { flex: 3, backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
              <Text style={[styles.meterZoneLabel, { color: colors.danger }]}>0-30cm (HALT)</Text>
            </View>
            <View style={[styles.meterZone, { flex: 7, backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
              <Text style={[styles.meterZoneLabel, { color: colors.warning }]}>30-100cm (SLOW)</Text>
            </View>
            <View style={[styles.meterZone, { flex: 15, backgroundColor: colors.successLight, borderColor: colors.success }]}>
              <Text style={[styles.meterZoneLabel, { color: colors.success }]}>100cm+ (CLEAR)</Text>
            </View>
          </View>

          {/* One-Click Simulator Buttons */}
          <Text style={[styles.simPrompt, { color: colors.textSecondary }]}>
            Test Robot Reaction Instantly:
          </Text>
          <View style={styles.simBtnRow}>
            <TouchableOpacity
              style={[
                styles.quickSimBtn,
                {
                  backgroundColor: lidar.distanceCm <= 30 ? colors.danger : colors.dangerLight,
                  borderColor: colors.danger,
                },
              ]}
              onPress={() => handleSimulateDistance(22)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickSimBtnText,
                  { color: lidar.distanceCm <= 30 ? '#FFFFFF' : colors.danger },
                ]}
              >
                🛑 Halt (22cm)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickSimBtn,
                {
                  backgroundColor: isWarning ? colors.warning : colors.warningLight,
                  borderColor: colors.warning,
                },
              ]}
              onPress={() => handleSimulateDistance(68)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickSimBtnText,
                  { color: isWarning ? '#FFFFFF' : colors.warning },
                ]}
              >
                ⚠️ Slow (68cm)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickSimBtn,
                {
                  backgroundColor: isSafe ? colors.success : colors.successLight,
                  borderColor: colors.success,
                },
              ]}
              onPress={() => handleSimulateDistance(156)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickSimBtnText,
                  { color: isSafe ? '#FFFFFF' : colors.success },
                ]}
              >
                ✅ Clear (156cm)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. SIMPLE DELIVERY JOURNEY STEPS */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
            Live Hospital Transit Route
          </Text>

          <View style={styles.journeyStepsRow}>
            {/* Step 1: Pharmacy */}
            <View style={styles.journeyStepItem}>
              <View style={[styles.stepIconCircle, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                <Feather name="check" size={16} color={colors.success} />
              </View>
              <Text style={[styles.stepLabelText, { color: colors.textPrimary }]}>Dispensary</Text>
              <Text style={[styles.stepSubText, { color: colors.textMuted }]}>Loaded</Text>
            </View>

            <View style={[styles.journeyDivider, { backgroundColor: colors.success }]} />

            {/* Step 2: Current Corridor */}
            <View style={styles.journeyStepItem}>
              <View style={[styles.stepIconCircle, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.stepLabelText, { color: colors.primary, fontWeight: '700' }]}>
                Floor {currentFloor} Corridor
              </Text>
              <Text style={[styles.stepSubText, { color: colors.primary }]}>Moving</Text>
            </View>

            <View style={[styles.journeyDivider, { backgroundColor: colors.border }]} />

            {/* Step 3: Bed */}
            <View style={styles.journeyStepItem}>
              <View style={[styles.stepIconCircle, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="bed-outline" size={16} color={colors.textMuted} />
              </View>
              <Text style={[styles.stepLabelText, { color: colors.textSecondary }]}>Bed #{targetBed}</Text>
              <Text style={[styles.stepSubText, { color: colors.textMuted }]}>Destination</Text>
            </View>
          </View>
        </View>

        {/* 4. ELEVATOR & FLOOR CONTROLS */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="elevator-passenger" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Elevator & Floor Navigation
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                Tap a floor below to command the robot to take the elevator:
              </Text>
            </View>
          </View>

          <View style={styles.floorRow}>
            {[1, 2, 3, 4, 5].map((fl) => {
              const isCurrent = currentFloor === fl;
              return (
                <TouchableOpacity
                  key={fl}
                  style={[
                    styles.floorTile,
                    {
                      backgroundColor: isCurrent ? colors.primary : colors.bgDark,
                      borderColor: isCurrent ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleFloorChange(fl)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.floorTileNumber,
                      { color: isCurrent ? colors.textInverted : colors.textPrimary },
                    ]}
                  >
                    Floor {fl}
                  </Text>
                  <Text
                    style={[
                      styles.floorTileLabel,
                      { color: isCurrent ? colors.textInverted : colors.textMuted },
                    ]}
                  >
                    {isCurrent ? 'Current' : 'Select'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. COLLAPSIBLE TECHNICAL SPECS */}
        <TouchableOpacity
          style={[styles.technicalToggle, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
          onPress={() => setShowTechnical(!showTechnical)}
          activeOpacity={0.7}
        >
          <View style={styles.technicalToggleLeft}>
            <MaterialCommunityIcons name="tune-vertical" size={18} color={colors.textSecondary} />
            <Text style={[styles.technicalToggleText, { color: colors.textPrimary }]}>
              {showTechnical ? 'Hide Technical Diagnostics' : 'Show Technical Hardware Diagnostics'}
            </Text>
          </View>
          <Feather name={showTechnical ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {showTechnical && (
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, marginTop: Spacing.sm }]}>
            <View style={styles.techRow}>
              <View style={styles.techCell}>
                <Text style={[styles.techLabel, { color: colors.textMuted }]}>Dual BO Drive Speed</Text>
                <Text style={[styles.techValue, { color: colors.textPrimary }]}>
                  {status === 'EMERGENCY_STOP' || lidar.brakeEngaged ? '0 RPM (Braked)' : '185 RPM (Synced)'}
                </Text>
              </View>
              <View style={styles.techCell}>
                <Text style={[styles.techLabel, { color: colors.textMuted }]}>5.0V Voltage Rail</Text>
                <Text style={[styles.techValue, { color: colors.success }]}>
                  {power.stepDownRail5V}V (Regulated)
                </Text>
              </View>
            </View>
            <View style={[styles.techRow, { marginTop: Spacing.sm }]}>
              <View style={styles.techCell}>
                <Text style={[styles.techLabel, { color: colors.textMuted }]}>Safety Brake</Text>
                <Text style={[styles.techValue, { color: lidar.brakeEngaged ? colors.danger : colors.success }]}>
                  {lidar.brakeEngaged ? 'ENGAGED' : 'RELEASED'}
                </Text>
              </View>
              <View style={styles.techCell}>
                <Text style={[styles.techLabel, { color: colors.textMuted }]}>Servo Deadbolt</Text>
                <Text style={[styles.techValue, { color: colors.textPrimary }]}>
                  {hatchState === 'UNLOCKED' ? '90° OPEN' : '0° LOCKED'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 6. BIG EMERGENCY STOP (E-STOP) BUTTON */}
        <View style={styles.estopContainer}>
          {emergencyStop ? (
            <TouchableOpacity
              style={[styles.estopBtn, { backgroundColor: colors.success }]}
              onPress={resetEmergencyStop}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="restart" size={24} color="#FFFFFF" />
              <Text style={styles.estopBtnText}>RESET EMERGENCY STOP & RESUME OPERATION</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.estopBtn, { backgroundColor: colors.danger }]}
              onPress={triggerEmergencyStop}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="octagon" size={26} color="#FFFFFF" />
              <Text style={styles.estopBtnText}>EMERGENCY STOP (E-STOP)</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.estopNotice, { color: colors.textMuted }]}>
            Instantly cuts motor power and engages mechanical safety lock.
          </Text>
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
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  robotIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  robotIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotName: {
    fontSize: 16,
    fontWeight: '700',
  },
  robotSub: {
    fontSize: 11,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  statCellSub: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 4,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  proximityHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  distanceHeroNumber: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'monospace',
    lineHeight: 34,
  },
  distanceHeroUnit: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginLeft: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  distanceExplanation: {
    fontSize: 12,
    lineHeight: 16,
  },
  meterTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  meterTrack: {
    flexDirection: 'row',
    height: 26,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    gap: 2,
    marginBottom: Spacing.md,
  },
  meterZone: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
  },
  meterZoneLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  simPrompt: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  simBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  quickSimBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickSimBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  journeyStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  journeyStepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabelText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepSubText: {
    fontSize: 10,
    marginTop: 1,
  },
  journeyDivider: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  floorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  floorTile: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  floorTileNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  floorTileLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  technicalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  technicalToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  technicalToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  techRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  techCell: {
    flex: 1,
  },
  techLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  techValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  estopContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  estopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  estopBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  estopNotice: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.xs + 2,
  },
});
