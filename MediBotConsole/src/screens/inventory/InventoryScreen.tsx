import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { DrugItem } from '../../types';

export const InventoryScreen = ({ navigation }: any) => {
  const {
    inventory,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    dispenseDrug,
    restockDrug,
  } = useInventoryStore();

  const [activeDrugModal, setActiveDrugModal] = useState<DrugItem | null>(null);
  const [modalAction, setModalAction] = useState<'RESTOCK' | 'DISPENSE'>('RESTOCK');
  const [quantityInput, setQuantityInput] = useState<string>('10');

  const categories = [
    { label: 'All SKUs', value: 'ALL' },
    { label: 'Critical Care', value: 'CRITICAL_CARE' },
    { label: 'Cardiac', value: 'EMERGENCY_CARDIAC' },
    { label: 'Antibiotics', value: 'ANTIBIOTIC' },
    { label: 'IV Fluids', value: 'IV_FLUID' },
    { label: 'Analgesics', value: 'ANALGESIC' },
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleModalSubmit = () => {
    if (!activeDrugModal) return;
    const qty = parseInt(quantityInput, 10) || 0;
    if (qty <= 0) return;

    if (modalAction === 'RESTOCK') {
      restockDrug(activeDrugModal.id, qty);
    } else {
      dispenseDrug(activeDrugModal.id, qty);
    }
    setActiveDrugModal(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Master Central Drug Dispensary Catalog (160+ SKUs)" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Controls: Search & Low Stock Link */}
        <View style={styles.topControlRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by drug name or SKU ID..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.lowStockQuickBtn}
            onPress={() => navigation?.navigate && navigation.navigate('LowStock')}
          >
            <MaterialCommunityIcons name="alert-decagram" size={18} color={Colors.warning} />
            <Text style={styles.lowStockBtnText}>Low Stock Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.catChip,
                selectedCategory === c.value && styles.catChipActive,
              ]}
              onPress={() => setSelectedCategory(c.value)}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCategory === c.value && styles.catChipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Drug Item Catalog */}
        {filteredItems.map((drug) => {
          const isLow = drug.quantity <= drug.absoluteFloorUnits;
          return (
            <View key={drug.id} style={styles.drugCard}>
              <View style={styles.drugCardTop}>
                <View style={styles.titleWithSku}>
                  <Text style={styles.drugName}>{drug.name}</Text>
                  <Text style={styles.skuId}>{drug.id}</Text>
                </View>
                {drug.isHighRisk && (
                  <StatusBadge label="HIGH RISK STAT" variant="danger" size="sm" />
                )}
              </View>

              <Text style={styles.drugDosage}>{drug.dosage}</Text>

              <View style={styles.stockDetailsRow}>
                <View style={styles.stockItem}>
                  <Text style={styles.stockLabel}>Current Stock:</Text>
                  <Text
                    style={[
                      styles.stockValue,
                      isLow && { color: Colors.danger, fontWeight: '800' },
                    ]}
                  >
                    {drug.quantity} {drug.unit}
                  </Text>
                </View>

                <View style={styles.stockItem}>
                  <Text style={styles.stockLabel}>Absolute Floor:</Text>
                  <Text style={styles.stockValue}>{drug.absoluteFloorUnits} {drug.unit}</Text>
                </View>

                <View style={styles.stockItem}>
                  <Text style={styles.stockLabel}>Unit Price:</Text>
                  <Text style={styles.stockValue}>₹{drug.pricePerUnit.toFixed(2)}</Text>
                </View>
              </View>

              {/* Action Buttons: Restock / Dispense */}
              <View style={styles.drugActionRow}>
                <TouchableOpacity
                  style={styles.restockBtn}
                  onPress={() => {
                    setActiveDrugModal(drug);
                    setModalAction('RESTOCK');
                    setQuantityInput('20');
                  }}
                >
                  <Feather name="plus-circle" size={14} color={Colors.primary} />
                  <Text style={styles.restockBtnText}>Restock Batch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dispenseBtn}
                  onPress={() => {
                    setActiveDrugModal(drug);
                    setModalAction('DISPENSE');
                    setQuantityInput('2');
                  }}
                >
                  <Feather name="minus-circle" size={14} color={Colors.textSecondary} />
                  <Text style={styles.dispenseBtnText}>Manual Dispense</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Restock/Dispense Modal */}
      {activeDrugModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {modalAction === 'RESTOCK' ? 'Restock Pharmacy Batch' : 'Dispense Drug SKU'}
              </Text>
              <Text style={styles.modalSub}>{activeDrugModal.name}</Text>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Quantity to {modalAction.toLowerCase()}:</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={quantityInput}
                  onChangeText={setQuantityInput}
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setActiveDrugModal(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleModalSubmit}
                >
                  <Text style={styles.modalConfirmText}>Confirm Operation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  topControlRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  lowStockQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
    height: 44,
  },
  lowStockBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
  },
  catScroll: {
    marginVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.textInverted,
  },
  drugCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  drugCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWithSku: {
    flex: 1,
  },
  drugName: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  skuId: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    marginTop: 1,
  },
  drugDosage: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  stockDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
  },
  stockItem: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  drugActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  restockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  restockBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dispenseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.bgDark,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dispenseBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  modalInputGroup: {
    marginBottom: Spacing.md,
  },
  modalInputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.bgDark,
    height: 44,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
  },
  modalConfirmText: {
    color: Colors.textInverted,
    fontSize: 12,
    fontWeight: '700',
  },
});
