import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useRole } from '../../hooks/useRole';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { Header } from '../../components/common/Header';
import { Radius, Spacing } from '../../theme/tokens';
import { DrugItem, DeliveryPriority } from '../../types';

export const DoctorOrderScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { currentUser, isDoctor, isNurse } = useRole();
  const { inventory, requestNewDrug } = useInventoryStore();
  const { createDelivery } = useDeliveryStore();

  // Selection state
  const [targetBed, setTargetBed] = useState<number>(12);
  const [targetFloor, setTargetFloor] = useState<number>(2);
  const [priority, setPriority] = useState<DeliveryPriority>('EMERGENCY_STAT');
  const [orderItems, setOrderItems] = useState<Array<{ drug: DrugItem; quantity: number }>>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Suggest New Drug Modal state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestDosage, setSuggestDosage] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<'CRITICAL_CARE' | 'ANTIBIOTIC' | 'ANALGESIC' | 'IV_FLUID' | 'EMERGENCY_CARDIAC'>('CRITICAL_CARE');
  const [suggestJustification, setSuggestJustification] = useState('');

  // Handle bed change: update floor automatically (10 beds per floor)
  const handleSelectBed = (bedNum: number) => {
    setTargetBed(bedNum);
    const calculatedFloor = Math.min(5, Math.max(1, Math.floor((bedNum - 1) / 10) + 1));
    setTargetFloor(calculatedFloor);
  };

  const handleToggleDrug = (drug: DrugItem) => {
    const existing = orderItems.find((it) => it.drug.id === drug.id);
    if (existing) {
      setOrderItems(orderItems.filter((it) => it.drug.id !== drug.id));
    } else {
      setOrderItems([...orderItems, { drug, quantity: 1 }]);
    }
  };

  const handleUpdateQty = (drugId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((it) => {
          if (it.drug.id === drugId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as Array<{ drug: DrugItem; quantity: number }>
    );
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      Alert.alert('No Medications Selected', 'Please select at least one prescription item from the formulary.');
      return;
    }

    const order = createDelivery({
      targetFloor,
      targetBed,
      priority,
      items: orderItems,
      prescribedBy: `${currentUser.name} (${currentUser.role})`,
    });

    Alert.alert(
      'Mission Order Placed',
      `Order ${order.orderNumber} dispatched to Central Dispensary for Chemist dispensing and payload lock. Target: Bed #${targetBed} (Floor ${targetFloor}).`,
      [
        {
          text: 'Track Mission',
          onPress: () => {
            navigation.navigate('DeliveryDetail', { deliveryId: order.id });
          },
        },
      ]
    );
  };

  const handleSendDrugProposal = () => {
    if (!suggestName.trim() || !suggestJustification.trim()) {
      Alert.alert('Missing Fields', 'Please provide medication name and clinical justification for the Chemist.');
      return;
    }

    requestNewDrug({
      requested_by: currentUser.name,
      drug_name: suggestName.trim(),
      recommended_dosage: suggestDosage.trim() || 'Standard Clinical Dosage',
      category: suggestCategory,
      justification: suggestJustification.trim(),
    });

    setIsSuggestModalOpen(false);
    setSuggestName('');
    setSuggestDosage('');
    setSuggestJustification('');

    Alert.alert(
      'Proposal Transmitted to Chemist',
      'Your request has been routed to the hospital central pharmacy approval queue. Chemist will review and create the catalog SKU.'
    );
  };

  const filteredInventory = inventory.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header subtitle="Physician Order & Bedside Delivery Desk" showBack={true} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Facility Bed Picker (Beds 1–50) */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bed" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Target Facility Destination
            </Text>
            <View style={[styles.targetBadge, { backgroundColor: theme.primary + '22', borderColor: theme.primary }]}>
              <Text style={[styles.targetBadgeText, { color: theme.primary }]}>
                BED #{targetBed} • FLOOR {targetFloor}
              </Text>
            </View>
          </View>

          {/* Floor Selector (Floors 1–5) */}
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>Select Ward Floor (1–5):</Text>
          <View style={styles.floorRow}>
            {[1, 2, 3, 4, 5].map((fl) => (
              <TouchableOpacity
                key={fl}
                style={[
                  styles.floorBtn,
                  {
                    backgroundColor: targetFloor === fl ? theme.primary : theme.surfaceElevated,
                    borderColor: targetFloor === fl ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  setTargetFloor(fl);
                  const firstBedOnFloor = (fl - 1) * 10 + 1;
                  setTargetBed(firstBedOnFloor);
                }}
              >
                <Text
                  style={[
                    styles.floorBtnText,
                    { color: targetFloor === fl ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Floor {fl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bed Units for Active Floor */}
          <Text style={[styles.subLabel, { color: theme.textMuted, marginTop: Spacing.sm }]}>
            Select Bed Unit on Floor {targetFloor} (Beds {(targetFloor - 1) * 10 + 1}–{targetFloor * 10}):
          </Text>
          <View style={styles.bedsGrid}>
            {Array.from({ length: 10 }, (_, i) => (targetFloor - 1) * 10 + i + 1).map((b) => (
              <TouchableOpacity
                key={b}
                style={[
                  styles.bedBtn,
                  {
                    backgroundColor: targetBed === b ? theme.primary : theme.surfaceElevated,
                    borderColor: targetBed === b ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => handleSelectBed(b)}
              >
                <Text
                  style={[
                    styles.bedBtnText,
                    { color: targetBed === b ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  #{b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 2: Urgency Priority */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="alert-decagram" size={20} color={theme.emergency} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Mission Priority</Text>
          </View>

          <View style={styles.priorityRow}>
            <TouchableOpacity
              style={[
                styles.priorityBtn,
                priority === 'EMERGENCY_STAT' && {
                  backgroundColor: theme.emergency + '22',
                  borderColor: theme.emergency,
                  borderWidth: 2,
                },
                priority !== 'EMERGENCY_STAT' && {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setPriority('EMERGENCY_STAT')}
            >
              <MaterialCommunityIcons name="alarm-light" size={20} color={theme.emergency} />
              <View>
                <Text style={[styles.priorityTitle, { color: theme.emergency }]}>EMERGENCY STAT</Text>
                <Text style={[styles.prioritySub, { color: theme.textMuted }]}>Immediate autonomous dispatch</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityBtn,
                priority === 'NORMAL' && {
                  backgroundColor: theme.primary + '22',
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
                priority !== 'NORMAL' && {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setPriority('NORMAL')}
            >
              <MaterialCommunityIcons name="clipboard-check" size={20} color={theme.primary} />
              <View>
                <Text style={[styles.priorityTitle, { color: theme.primary }]}>ROUTINE ORDER</Text>
                <Text style={[styles.prioritySub, { color: theme.textMuted }]}>Standard ward delivery queue</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Medication Selector from Active Formulary */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="pill" size={20} color={theme.accent} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Formulary Medication Selection
            </Text>
          </View>

          {/* Link to Doctor Suggest New Drug Modal */}
          <TouchableOpacity
            style={[styles.suggestLinkCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.accent }]}
            onPress={() => setIsSuggestModalOpen(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.suggestLinkTitle, { color: theme.accent }]}>
                Need an unlisted medicine?
              </Text>
              <Text style={[styles.suggestLinkSub, { color: theme.textSecondary }]}>
                Submit a new drug proposal directly to the Chemist's queue.
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={theme.accent} />
          </TouchableOpacity>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Feather name="search" size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search formulary drugs..."
              placeholderTextColor={theme.textMuted}
              value={searchFilter}
              onChangeText={setSearchFilter}
            />
          </View>

          {/* Active Selection Summary */}
          {orderItems.length > 0 && (
            <View style={[styles.selectedSummary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <Text style={[styles.selectedHeader, { color: theme.textPrimary }]}>
                Selected for Bed #{targetBed} ({orderItems.length} items):
              </Text>
              {orderItems.map((it) => (
                <View key={it.drug.id} style={styles.summaryItemRow}>
                  <Text style={[styles.summaryDrugName, { color: theme.textPrimary }]}>
                    {it.drug.name}
                  </Text>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleUpdateQty(it.drug.id, -1)}
                    >
                      <Feather name="minus" size={14} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: theme.textPrimary }]}>{it.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleUpdateQty(it.drug.id, 1)}
                    >
                      <Feather name="plus" size={14} color={theme.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Drug Selection List */}
          <View style={styles.drugList}>
            {filteredInventory.slice(0, 12).map((drug) => {
              const isSelected = orderItems.some((it) => it.drug.id === drug.id);
              return (
                <TouchableOpacity
                  key={drug.id}
                  style={[
                    styles.drugItemRow,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.inputBg,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleToggleDrug(drug)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.drugIdBadge, { color: theme.primary }]}>{drug.id}</Text>
                      <Text style={[styles.drugItemName, { color: theme.textPrimary }]}>{drug.name}</Text>
                    </View>
                    <Text style={[styles.drugItemDosage, { color: theme.textSecondary }]}>
                      {drug.dosage} • Available: {drug.quantity} {drug.unit}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={isSelected ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dispatch Button */}
        <TouchableOpacity
          style={[styles.dispatchSubmitBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmitOrder}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
          <Text style={styles.dispatchSubmitText}>
            Dispatch Delivery Order to Bed #{targetBed}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Suggest New Drug Modal (Doctor only proposal workflow) */}
      <Modal visible={isSuggestModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.accent} />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Suggest New Drug to Chemist
              </Text>
            </View>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Doctors cannot add medications to inventory directly. Propose an unlisted formulation for Chemist review & catalog induction:
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>Medication Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. Dexamethasone 4mg/mL"
                placeholderTextColor={theme.textMuted}
                value={suggestName}
                onChangeText={setSuggestName}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>Recommended Formulation & Dosage</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. 2mL Ampoule IV Injection"
                placeholderTextColor={theme.textMuted}
                value={suggestDosage}
                onChangeText={setSuggestDosage}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>Clinical Justification</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border, height: 70, textAlignVertical: 'top' },
                ]}
                placeholder="Specific clinical rationale, patient bed requirement, or specialty protocol..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={suggestJustification}
                onChangeText={setSuggestJustification}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setIsSuggestModalOpen(false)}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSendBtn, { backgroundColor: theme.accent }]}
                onPress={handleSendDrugProposal}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Submit Proposal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  subLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  floorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  floorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  floorBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bedsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bedBtn: {
    width: '18%',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  bedBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
  },
  priorityTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  prioritySub: {
    fontSize: 10,
    marginTop: 1,
  },
  suggestLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  suggestLinkTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  suggestLinkSub: {
    fontSize: 10,
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  selectedSummary: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  selectedHeader: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryDrugName: {
    fontSize: 11,
    flex: 1,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  drugList: {
    gap: 6,
  },
  drugItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  drugIdBadge: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  drugItemName: {
    fontSize: 12,
    fontWeight: '600',
  },
  drugItemDosage: {
    fontSize: 10,
    marginTop: 2,
  },
  dispatchSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  dispatchSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  modalInputGroup: {
    marginBottom: Spacing.sm,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalInput: {
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  modalSendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
});
