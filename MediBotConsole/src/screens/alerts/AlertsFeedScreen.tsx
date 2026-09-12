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
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AlertTier, SystemAlertItem } from '../../types';

const INITIAL_SYSTEM_ALERTS: SystemAlertItem[] = [
  {
    id: 'ALT-SYS-01',
    tier: 'TIER_1_CRITICAL',
    title: 'TF-Luna LiDAR Critical Safety Brake Engaged',
    message: 'Dynamic obstacle detected <=30cm at Floor 3 Corridor Node 4. Dual BO motors automatically halted.',
    timestamp: '10:42:15 AM',
    source: 'LIDAR',
  },
  {
    id: 'ALT-SYS-02',
    tier: 'TIER_1_CRITICAL',
    title: 'EMERGENCY STAT Mission Dispatched to Bed 12',
    message: 'Dr. Anita Mehta dispatched Adrenaline 1mg/mL & Atropine Sulfate with high-priority lift preemption.',
    timestamp: '10:35:00 AM',
    source: 'EMERGENCY',
  },
  {
    id: 'ALT-SYS-03',
    tier: 'TIER_2_ESSENTIAL',
    title: 'Absolute Low-Stock Breach: Adrenaline 1mg/mL',
    message: 'Dispensary reserves fallen to 14 units (Threshold: <=20 units). Automated restock requisition opened.',
    timestamp: '09:15:30 AM',
    source: 'PHARMACY',
  },
  {
    id: 'ALT-SYS-04',
    tier: 'TIER_2_ESSENTIAL',
    title: 'Dual 18650 Battery Voltage Advisory (7.42V)',
    message: 'Estimated remaining mission runtime: 1.8 hrs. Scheduled return to Base Dock #1 after active transit.',
    timestamp: '08:50:12 AM',
    source: 'HARDWARE',
  },
  {
    id: 'ALT-SYS-05',
    tier: 'TIER_3_ROUTINE',
    title: 'Multi-Floor Lift Node Arrival Verified',
    message: 'ESP32 optocoupler relay signaled Floor 3 arrival. Shaft door interlock opened successfully.',
    timestamp: '08:22:45 AM',
    source: 'HARDWARE',
  },
  {
    id: 'ALT-SYS-06',
    tier: 'TIER_3_ROUTINE',
    title: 'Mission MB-2026-0889 Completed & Archived',
    message: 'Nurse Sarah Joseph verified 4-digit PIN (1904) at Bed 38. SG90 servo deadbolt locked.',
    timestamp: '07:45:10 AM',
    source: 'PHARMACY',
  },
];

export const AlertsFeedScreen = () => {
  const [selectedTier, setSelectedTier] = useState<AlertTier | 'ALL'>('ALL');

  const filteredAlerts = selectedTier === 'ALL'
    ? INITIAL_SYSTEM_ALERTS
    : INITIAL_SYSTEM_ALERTS.filter((a) => a.tier === selectedTier);

  const getTierColor = (tier: AlertTier) => {
    switch (tier) {
      case 'TIER_1_CRITICAL':
        return Colors.danger;
      case 'TIER_2_ESSENTIAL':
        return Colors.warning;
      case 'TIER_3_ROUTINE':
      default:
        return Colors.info;
    }
  };

  const getTierBadge = (tier: AlertTier) => {
    switch (tier) {
      case 'TIER_1_CRITICAL':
        return <StatusBadge label="TIER 1 • CRITICAL" variant="danger" size="sm" />;
      case 'TIER_2_ESSENTIAL':
        return <StatusBadge label="TIER 2 • ESSENTIAL" variant="warning" size="sm" />;
      case 'TIER_3_ROUTINE':
        return <StatusBadge label="TIER 3 • ROUTINE" variant="info" size="sm" />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Tiered Emergency & Safety Interlock Stream" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tier Filter Tabs */}
        <View style={styles.filterRow}>
          {[
            { label: 'All Alerts', value: 'ALL' },
            { label: 'Tier 1 (Critical)', value: 'TIER_1_CRITICAL' },
            { label: 'Tier 2 (Stock)', value: 'TIER_2_ESSENTIAL' },
            { label: 'Tier 3 (Logs)', value: 'TIER_3_ROUTINE' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.filterTab,
                selectedTier === tab.value && styles.filterTabActive,
              ]}
              onPress={() => setSelectedTier(tab.value as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedTier === tab.value && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alert Cards Feed */}
        {filteredAlerts.map((item) => (
          <View
            key={item.id}
            style={[styles.alertCard, { borderLeftColor: getTierColor(item.tier), borderLeftWidth: 4 }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badgeGroup}>
                {getTierBadge(item.tier)}
                <Text style={styles.sourceTag}>{item.source}</Text>
              </View>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>

            <Text style={styles.alertTitle}>{item.title}</Text>
            <Text style={styles.alertMessage}>{item.message}</Text>
          </View>
        ))}
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
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textInverted,
  },
  alertCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceTag: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    backgroundColor: Colors.bgDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  timestampText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  alertTitle: {
    ...Typography.titleSmall,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
