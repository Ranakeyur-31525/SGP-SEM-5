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
import { useInventoryStore } from '../../stores/useInventoryStore';

export const LowStockScreen = () => {
  const { getLowStockItems, restockDrug } = useInventoryStore();
  const lowStockList = getLowStockItems();

  const handleRestockAll = () => {
    lowStockList.forEach((item) => {
      restockDrug(item.drug.id, item.drug.absoluteFloorUnits * 2);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Dual-Threshold Pharmacy Low Stock Center" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dual-Threshold Architecture Summary Banner */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTitleRow}>
            <MaterialCommunityIcons name="alert-decagram" size={22} color={Colors.warning} />
            <Text style={styles.summaryTitle}>Dual-Threshold Safety Interlock</Text>
          </View>
          <Text style={styles.summaryDesc}>
            Algorithms evaluate both <Text style={{ color: Colors.primary, fontWeight: '700' }}>Percentage Reserve (&lt;20%)</Text> and <Text style={{ color: Colors.danger, fontWeight: '700' }}>Absolute Unit Floor (e.g. &lt;=20 ampoules)</Text> to eliminate hospital stockouts.
          </Text>

          <View style={styles.statCountersRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{lowStockList.length}</Text>
              <Text style={styles.statLabel}>Deficit SKUs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.danger }]}>
                {lowStockList.filter((i) => i.drug.isHighRisk).length}
              </Text>
              <Text style={styles.statLabel}>Critical Care</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>Active</Text>
              <Text style={styles.statLabel}>Auto-Requisition</Text>
            </View>
          </View>
        </View>

        {/* Batch Re-order Action Button */}
        {lowStockList.length > 0 && (
          <TouchableOpacity
            style={styles.reorderBatchBtn}
            onPress={handleRestockAll}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cart-plus" size={20} color={Colors.textInverted} />
            <Text style={styles.reorderBatchBtnText}>
              Execute Emergency Batch Re-order (All Deficits)
            </Text>
          </TouchableOpacity>
        )}

        {/* Low Stock Item Cards */}
        {lowStockList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={32} color={Colors.success} />
            <Text style={styles.emptyTitle}>All Pharmacy Formulary Stock Normal</Text>
            <Text style={styles.emptySubtitle}>No items breached dual-threshold safety limits.</Text>
          </View>
        ) : (
          lowStockList.map(({ drug, triggerReason }) => (
            <View key={drug.id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={styles.titleWithCat}>
                  <Text style={styles.drugName}>{drug.name}</Text>
                  <Text style={styles.drugCategory}>{drug.category} • {drug.id}</Text>
                </View>
                {drug.isHighRisk && (
                  <StatusBadge label="CRITICAL STAT" variant="danger" size="sm" />
                )}
              </View>

              {/* Breach Banner */}
              <View style={styles.breachBanner}>
                <Feather name="alert-triangle" size={14} color={Colors.warning} />
                <Text style={styles.breachText}>{triggerReason}</Text>
              </View>

              <View style={styles.stockNumbersRow}>
                <View style={styles.stockCol}>
                  <Text style={styles.stockColLabel}>Remaining Stock:</Text>
                  <Text style={styles.stockColValueRed}>
                    {drug.quantity} {drug.unit}
                  </Text>
                </View>

                <View style={styles.stockCol}>
                  <Text style={styles.stockColLabel}>Absolute Floor:</Text>
                  <Text style={styles.stockColValue}>
                    {drug.absoluteFloorUnits} {drug.unit}
                  </Text>
                </View>

                <View style={styles.stockCol}>
                  <Text style={styles.stockColLabel}>Minimum %:</Text>
                  <Text style={styles.stockColValue}>{drug.minThresholdPercent}%</Text>
                </View>
              </View>

              {/* Single Restock Button */}
              <TouchableOpacity
                style={styles.restockSingleBtn}
                onPress={() => restockDrug(drug.id, 25)}
              >
                <Feather name="refresh-cw" size={13} color={Colors.primary} />
                <Text style={styles.restockSingleText}>Restock +25 Units</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  summaryTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  statCountersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.warning,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  reorderBatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  reorderBatchBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverted,
  },
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWithCat: {
    flex: 1,
  },
  drugName: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  drugCategory: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  breachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginVertical: Spacing.sm,
  },
  breachText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
  },
  stockNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginVertical: 4,
  },
  stockCol: {
    alignItems: 'center',
  },
  stockColLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  stockColValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stockColValueRed: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.danger,
    fontFamily: 'monospace',
  },
  restockSingleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  restockSingleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
