import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { LidarTelemetry } from '../../types';

interface LidarGaugeProps {
  lidar: LidarTelemetry;
}

export const LidarGauge: React.FC<LidarGaugeProps> = ({ lidar }) => {
  const { distanceCm, brakeEngaged, signalQuality } = lidar;

  // Determine Alert Level
  const isCriticalHalt = distanceCm <= 30 || brakeEngaged;
  const isWarning = distanceCm > 30 && distanceCm < 100;
  const isSafe = distanceCm >= 100;

  const getStatusColor = () => {
    if (isCriticalHalt) return Colors.danger;
    if (isWarning) return Colors.warning;
    return Colors.success;
  };

  const getStatusLabel = () => {
    if (isCriticalHalt) return 'CRITICAL BRAKE ENGAGED (<=30cm)';
    if (isWarning) return 'OBSTACLE PROXIMITY WARNING (<100cm)';
    return 'PATH CLEAR / TOF RADAR NORMAL';
  };

  // Clamp bar percentage between 0 and 100 (Max range visualized = 200cm)
  const clampedPercent = Math.min(Math.max((distanceCm / 200) * 100, 4), 100);

  return (
    <View style={[styles.container, { borderColor: getStatusColor() }]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <MaterialCommunityIcons name="radar" size={22} color={getStatusColor()} />
          <Text style={styles.titleText}>TF-LUNA ToF LIDAR (100Hz Safety Brake)</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: isCriticalHalt ? Colors.dangerLight : isWarning ? Colors.warningLight : Colors.successLight }]}>
          <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
            {isCriticalHalt ? 'HALT' : isWarning ? 'WARN' : 'SECURE'}
          </Text>
        </View>
      </View>

      {/* Main Distance Readout */}
      <View style={styles.readoutRow}>
        <View style={styles.distanceDisplay}>
          <Text style={[styles.distanceNumber, { color: getStatusColor() }]}>
            {distanceCm}
          </Text>
          <Text style={styles.unitText}>cm</Text>
        </View>

        <View style={styles.metadataColumn}>
          <View style={styles.metaItem}>
            <Feather name="activity" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaLabel}>Signal Quality:</Text>
            <Text style={styles.metaValue}>{signalQuality}%</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="shield" size={14} color={getStatusColor()} />
            <Text style={styles.metaLabel}>Interlock:</Text>
            <Text style={[styles.metaValue, { color: getStatusColor(), fontWeight: '700' }]}>
              {brakeEngaged ? 'ENGAGED' : 'STANDBY'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={Colors.textMuted} />
            <Text style={styles.metaLabel}>Updated:</Text>
            <Text style={styles.metaValue}>{lidar.timestamp || 'Live'}</Text>
          </View>
        </View>
      </View>

      {/* Threshold Progress Bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${clampedPercent}%`,
              backgroundColor: getStatusColor(),
            },
          ]}
        />
        {/* Threshold indicator line at 30cm (15%) */}
        <View style={[styles.thresholdMarker, { left: '15%' }]}>
          <Text style={styles.thresholdMarkerText}>30cm</Text>
        </View>
        {/* Threshold indicator line at 100cm (50%) */}
        <View style={[styles.thresholdMarker, { left: '50%' }]}>
          <Text style={styles.thresholdMarkerText}>100cm</Text>
        </View>
      </View>

      {/* Alert Banner */}
      <View style={[styles.alertBanner, { backgroundColor: isCriticalHalt ? Colors.dangerLight : isWarning ? Colors.warningLight : 'rgba(16, 185, 129, 0.08)' }]}>
        <Feather
          name={isCriticalHalt ? 'alert-octagon' : isWarning ? 'alert-triangle' : 'check-circle'}
          size={16}
          color={getStatusColor()}
        />
        <Text style={[styles.alertBannerText, { color: getStatusColor() }]}>
          {getStatusLabel()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
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
    gap: Spacing.xs + 2,
    flex: 1,
  },
  titleText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    fontSize: 11,
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.sm,
  },
  distanceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  distanceNumber: {
    fontSize: 38,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metadataColumn: {
    gap: 4,
    alignItems: 'flex-start',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  barTrack: {
    height: 12,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thresholdMarkerText: {
    position: 'absolute',
    top: -14,
    fontSize: 9,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  alertBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
