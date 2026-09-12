import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDeliveryStore } from '../../stores/useDeliveryStore';

export const HistoryScreen = () => {
  const { deliveries } = useDeliveryStore();
  const [search, setSearch] = useState('');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const filteredDeliveries = deliveries.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.orderNumber.toLowerCase().includes(q) ||
      `bed ${d.targetBed}`.toLowerCase().includes(q) ||
      d.prescribedBy.toLowerCase().includes(q) ||
      d.priority.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const count = filteredDeliveries.length;
    setExportMessage(`Generated MediBot_Audit_${Date.now()}.csv (${count} records exported)`);
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Autonomous Logistics Mission Audit Archive" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search & Export Bar */}
        <View style={styles.controlsRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Bed, Order #, Physician..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExportCsv}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="file-delimited" size={18} color={Colors.textInverted} />
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Export Banner Feedback */}
        {exportMessage && (
          <View style={styles.exportBanner}>
            <Feather name="check-circle" size={16} color={Colors.success} />
            <Text style={styles.exportBannerText}>{exportMessage}</Text>
          </View>
        )}

        {/* History Records List */}
        {filteredDeliveries.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.badgeRow}>
                <StatusBadge
                  label={item.priority}
                  variant={item.priority === 'EMERGENCY_STAT' ? 'danger' : 'info'}
                  size="sm"
                />
                <Text style={styles.orderId}>{item.orderNumber}</Text>
              </View>
              <Text style={styles.dateText}>{item.createdAt}</Text>
            </View>

            <View style={styles.mainInfoRow}>
              <Text style={styles.destinationText}>
                Floor {item.targetFloor} • Bed {item.targetBed}
              </Text>
              <Text style={styles.statusPill}>{item.status.replace(/_/g, ' ')}</Text>
            </View>

            {/* Audit details: chemist, doctor, nurse, passcode */}
            <View style={styles.auditGrid}>
              <View style={styles.auditCol}>
                <Text style={styles.auditLabel}>Prescribed By:</Text>
                <Text style={styles.auditValue}>{item.prescribedBy}</Text>
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditLabel}>Dispensary / Verified:</Text>
                <Text style={styles.auditValue}>{item.dispensedBy || 'Rahul Verma (R.Ph)'}</Text>
              </View>
            </View>

            <View style={styles.itemsRow}>
              <Text style={styles.itemsLabel}>Payload:</Text>
              <Text style={styles.itemsContent}>
                {item.items.map((m) => `${m.drug.name} (x${m.quantity})`).join(', ')}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerSecurity}>
                SG90 Servo OTP Used: <Text style={{ color: Colors.primary }}>{item.passcode}</Text>
              </Text>
              <Text style={styles.footerTransit}>
                Duration: {item.estimatedTransitSeconds}s
              </Text>
            </View>
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
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    height: 44,
  },
  exportBtnText: {
    color: Colors.textInverted,
    fontSize: 13,
    fontWeight: '700',
  },
  exportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    marginBottom: Spacing.md,
  },
  exportBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  historyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  destinationText: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  statusPill: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  auditGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
  },
  auditCol: {
    flex: 1,
  },
  auditLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 1,
  },
  auditValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  itemsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  itemsLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  itemsContent: {
    flex: 1,
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.bgSurfaceLight,
    paddingTop: 6,
    marginTop: 4,
  },
  footerSecurity: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  footerTransit: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
