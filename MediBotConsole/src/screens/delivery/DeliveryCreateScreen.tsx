import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useBillingStore } from '../../stores/useBillingStore';
import { useTheme } from '../../hooks/useTheme';
import { DeliveryPriority, DrugItem } from '../../types';

export const DeliveryCreateScreen = ({ navigation, route }: any) => {
  const defaultPriority: DeliveryPriority = route?.params?.defaultPriority || 'NORMAL';
  const { colors } = useTheme();
  const { createDelivery } = useDeliveryStore();
  const { inventory } = useInventoryStore();
  const { currentUser } = useAuthStore();
  const { addMedicineCharge, addDeliveryFee } = useBillingStore();

  const [floor, setFloor] = useState<number>(2);
  const [bed, setBed] = useState<number>(12);
  const [priority, setPriority] = useState<DeliveryPriority>(defaultPriority);

  const floorBeds = Array.from({ length: 10 }, (_, i) => (floor - 1) * 10 + i + 1);

  const handleSelectFloor = (f: number) => {
    setFloor(f);
    const minBed = (f - 1) * 10 + 1;
    const maxBed = f * 10;
    if (bed < minBed || bed > maxBed) {
      setBed(minBed);
    }
  };
  const [selectedMeds, setSelectedMeds] = useState<Array<{ drug: DrugItem; quantity: number }>>([
    { drug: inventory[0], quantity: 2 },
  ]);

  // Generate 4-digit passcode preview
  const [previewPin] = useState<string>(Math.floor(1000 + Math.random() * 9000).toString());

  const toggleDrug = (drug: DrugItem) => {
    const existing = selectedMeds.find((m) => m.drug.id === drug.id);
    if (existing) {
      setSelectedMeds(selectedMeds.filter((m) => m.drug.id !== drug.id));
    } else {
      setSelectedMeds([...selectedMeds, { drug, quantity: 1 }]);
    }
  };

  const updateQuantity = (drugId: string, delta: number) => {
    setSelectedMeds(
      selectedMeds
        .map((m) => {
          if (m.drug.id === drugId) {
            const nextQty = m.quantity + delta;
            return nextQty > 0 ? { ...m, quantity: nextQty } : null;
          }
          return m;
        })
        .filter(Boolean) as Array<{ drug: DrugItem; quantity: number }>
    );
  };

  const handleDispatch = () => {
    if (selectedMeds.length === 0) {
      Alert.alert('Empty Payload', 'Please attach at least one medicine item to dispatch.');
      return;
    }

    const created = createDelivery({
      targetFloor: floor,
      targetBed: bed,
      priority,
      items: selectedMeds,
      prescribedBy: currentUser.name,
    });

    // Update patient billing
    selectedMeds.forEach((m) => {
      addMedicineCharge(bed, `${m.drug.name} (${m.drug.dosage})`, m.quantity, m.drug.pricePerUnit);
    });
    addDeliveryFee(bed);

    if (navigation?.navigate) {
      navigation.navigate('DeliveryDetail', { deliveryId: created.id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Autonomous Robot Mission Dispatcher" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Priority Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mission Urgency / Priority Tier</Text>
          <View style={styles.priorityRow}>
            <TouchableOpacity
              style={[
                styles.priorityBtn,
                priority === 'NORMAL' && styles.priorityBtnNormalActive,
              ]}
              onPress={() => setPriority('NORMAL')}
            >
              <Feather
                name="clock"
                size={16}
                color={priority === 'NORMAL' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.priorityBtnText,
                  priority === 'NORMAL' && styles.priorityBtnTextActive,
                ]}
              >
                Routine (Normal)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityBtn,
                priority === 'EMERGENCY_STAT' && styles.priorityBtnStatActive,
              ]}
              onPress={() => setPriority('EMERGENCY_STAT')}
            >
              <MaterialCommunityIcons
                name="ambulance"
                size={18}
                color={priority === 'EMERGENCY_STAT' ? Colors.danger : Colors.textMuted}
              />
              <Text
                style={[
                  styles.priorityBtnText,
                  priority === 'EMERGENCY_STAT' && { color: Colors.danger, fontWeight: '800' },
                ]}
              >
                EMERGENCY STAT
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Destination: Floor & Bed */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              Target Facility Destination
            </Text>
          </View>

          {/* Floor 1 - 5 Selector */}
          <Text style={[styles.inputSublabel, { color: colors.textSecondary }]}>
            Step 1: Select Target Ward Floor (1 to 5)
          </Text>
          <View style={styles.floorRow}>
            {[1, 2, 3, 4, 5].map((f) => {
              const isActive = floor === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.floorBtn,
                    {
                      backgroundColor: isActive ? colors.primary : colors.bgInput,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleSelectFloor(f)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.floorBtnText,
                      { color: isActive ? colors.textInverted : colors.textPrimary },
                    ]}
                  >
                    Floor {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bed Selector: ONLY 10 beds of the selected floor */}
          <Text style={[styles.inputSublabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Step 2: Select Bed on Floor {floor} (Beds {(floor - 1) * 10 + 1} - {floor * 10})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bedScroll}>
            {floorBeds.map((b) => {
              const isActive = bed === b;
              return (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.bedBtn,
                    {
                      backgroundColor: isActive ? colors.primary : colors.bgDark,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setBed(b)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.bedBtnText,
                      { color: isActive ? colors.textInverted : colors.textPrimary },
                    ]}
                  >
                    Bed {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Auto-Generated SG90 Lock Passcode */}
        <View style={styles.passcodeCard}>
          <View style={styles.passcodeLeft}>
            <MaterialCommunityIcons name="shield-key" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.passcodeLabel}>SG90 Servo Deadbolt 4-Digit OTP</Text>
              <Text style={styles.passcodeDesc}>
                Auto-assigned to nurse/bedside recipient
              </Text>
            </View>
          </View>
          <View style={styles.passcodeBox}>
            <Text style={styles.passcodeNumber}>{previewPin}</Text>
          </View>
        </View>

        {/* Medicine Payload Selection */}
        <View style={styles.card}>
          <View style={styles.medHeaderRow}>
            <Text style={styles.cardTitle}>Select Drug Payload from Dispensary</Text>
            <Text style={styles.medCountBadge}>{selectedMeds.length} Items</Text>
          </View>

          {inventory.slice(0, 7).map((drug) => {
            const selected = selectedMeds.find((m) => m.drug.id === drug.id);
            return (
              <View
                key={drug.id}
                style={[styles.drugItemRow, selected && styles.drugItemRowSelected]}
              >
                <TouchableOpacity
                  style={styles.drugInfoGroup}
                  onPress={() => toggleDrug(drug)}
                >
                  <View
                    style={[
                      styles.checkCircle,
                      selected && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                    ]}
                  >
                    {selected && <Feather name="check" size={12} color={Colors.bgDark} />}
                  </View>
                  <View style={styles.drugTextWrapper}>
                    <Text style={styles.drugName}>{drug.name}</Text>
                    <Text style={styles.drugDosage}>
                      {drug.dosage} • Stock: {drug.quantity} {drug.unit}
                    </Text>
                  </View>
                </TouchableOpacity>

                {selected && (
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(drug.id, -1)}
                    >
                      <Feather name="minus" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{selected.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(drug.id, 1)}
                    >
                      <Feather name="plus" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Dispatch Button */}
        <TouchableOpacity
          style={styles.dispatchBtn}
          onPress={handleDispatch}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="robot" size={22} color={Colors.textInverted} />
          <Text style={styles.dispatchBtnText}>
            Confirm Compartment & Dispatch MediBot
          </Text>
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
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgDark,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityBtnNormalActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
  },
  priorityBtnStatActive: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priorityBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputSublabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  floorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  floorBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floorBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  floorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  floorBtnTextActive: {
    color: Colors.textInverted,
  },
  bedScroll: {
    marginVertical: 4,
  },
  bedBtn: {
    width: 64,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bedBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 180, 216, 0.2)',
  },
  bedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bedBtnTextActive: {
    color: Colors.primary,
  },
  passcodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCardSecondary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  passcodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  passcodeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  passcodeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  passcodeBox: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  passcodeNumber: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  medCountBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  drugItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgSurfaceLight,
  },
  drugItemRowSelected: {
    backgroundColor: 'rgba(0, 180, 216, 0.05)',
  },
  drugInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drugTextWrapper: {
    flex: 1,
  },
  drugName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  drugDosage: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 16,
    textAlign: 'center',
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  dispatchBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textInverted,
  },
});
