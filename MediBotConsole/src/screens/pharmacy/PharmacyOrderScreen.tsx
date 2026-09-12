import React, { useState, useMemo } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/useAuthStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { usePharmacyOrderStore } from '../../stores/usePharmacyOrderStore';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';

const CATEGORIES = [
  { label: 'All Items', value: 'ALL' },
  { label: 'Critical Care', value: 'CRITICAL_CARE' },
  { label: 'Cardiac STAT', value: 'EMERGENCY_CARDIAC' },
  { label: 'Antibiotics', value: 'ANTIBIOTIC' },
  { label: 'Analgesics', value: 'ANALGESIC' },
  { label: 'IV Fluids', value: 'IV_FLUID' },
];

export const PharmacyOrderScreen = () => {
  const { colors } = useTheme();
  const { currentUser } = useAuthStore();
  const { isPatient } = useRole();
  const { inventory } = useInventoryStore();
  const { placeOrder } = usePharmacyOrderStore();
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [priority, setPriority] = useState<'NORMAL' | 'EMERGENCY_STAT'>('NORMAL');
  const [selectedFloor, setSelectedFloor] = useState(isPatient ? 2 : 2);
  const [selectedBed, setSelectedBed] = useState(isPatient ? 12 : 12);
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);

  // Filter drugs based on category and query
  const filteredDrugs = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCat = selectedCat === 'ALL' || item.category === selectedCat;
      const matchesQuery =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.dosage.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [inventory, search, selectedCat]);

  const handleUpdateQty = (drugId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[drugId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[drugId];
        return copy;
      }
      return { ...prev, [drugId]: updated };
    });
  };

  const selectedCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const selectedTotalCost = Object.entries(quantities).reduce((acc, [id, qty]) => {
    const item = inventory.find((d) => d.id === id);
    return acc + (item ? item.pricePerUnit * qty : 0);
  }, 0);

  const handlePlaceOrder = () => {
    if (selectedCount === 0) {
      Alert.alert('Empty Cart', 'Please select at least one medication to place an order.');
      return;
    }

    const itemsList = Object.entries(quantities).map(([id, qty]) => {
      const item = inventory.find((d) => d.id === id);
      return `${item?.name} x ${qty} (${item?.dosage})`;
    });

    const newOrder = placeOrder({
      patient_id: currentUser.id,
      patient_name: isPatient ? currentUser.name : `Patient at Bed ${selectedBed}`,
      patient_floor: isPatient ? 2 : selectedFloor,
      patient_bed: isPatient ? 12 : selectedBed,
      ordered_by_role: isPatient ? 'user' : 'doctor',
      order_type: 'text_input',
      items_list: itemsList,
    });

    setSubmittedOrder(newOrder.order_id);
    setQuantities({});
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgDark }]}>
      <Header subtitle="Request Pharmacy & Medical Shop Order" />

      {/* Confirmation Banner if order placed */}
      {submittedOrder && (
        <View style={[styles.successBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.successTitle, { color: colors.success }]}>Order {submittedOrder} Dispatched!</Text>
            <Text style={[styles.successSub, { color: colors.textPrimary }]}>
              Sent to Central Chemist Dispensary. Turnaround dispatch initiated for Bed {isPatient ? 12 : selectedBed}.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bannerBtn, { backgroundColor: colors.success }]}
            onPress={() => setSubmittedOrder(null)}
          >
            <Text style={styles.bannerBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bed Destination Assignment */}
      <View style={[styles.destinationCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={styles.destHeader}>
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
          <Text style={[styles.destTitle, { color: colors.textPrimary }]}>
            Destination Delivery Ward
          </Text>
          {isPatient && (
            <View style={[styles.lockedPill, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
              <MaterialCommunityIcons name="lock" size={12} color={colors.warning} />
              <Text style={[styles.lockedPillText, { color: colors.warning }]}>BED 12 LOCKED</Text>
            </View>
          )}
        </View>

        <Text style={[styles.destSub, { color: colors.textMuted }]}>
          {isPatient
            ? `Assigned Patient: ${currentUser.name} • Floor 2 Cardiology • Bed #12`
            : `Facility Delivery Target: Floor ${selectedFloor}, Bed #${selectedBed}`}
        </Text>

        {!isPatient && (
          <View style={styles.staffBedSelectorRow}>
            <View style={styles.floorPicker}>
              <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Floor</Text>
              <View style={styles.chipRow}>
                {[1, 2, 3, 4, 5].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.floorChip,
                      { backgroundColor: selectedFloor === f ? colors.primary : colors.bgInput },
                    ]}
                    onPress={() => setSelectedFloor(f)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedFloor === f ? colors.textInverted : colors.textSecondary },
                      ]}
                    >
                      F{f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.bedPicker}>
              <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Bed (1-50)</Text>
              <View style={styles.chipRow}>
                {[1, 5, 12, 24, 38, 45].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.floorChip,
                      { backgroundColor: selectedBed === b ? colors.accent : colors.bgInput },
                    ]}
                    onPress={() => setSelectedBed(b)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selectedBed === b ? colors.textInverted : colors.textSecondary },
                      ]}
                    >
                      #{b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Priority Selection */}
      <View style={[styles.priorityRow, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[styles.priorityLabel, { color: colors.textPrimary }]}>Mission Priority:</Text>
        <View style={styles.priorityBtnGroup}>
          <TouchableOpacity
            style={[
              styles.priorityBtn,
              priority === 'NORMAL' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPriority('NORMAL')}
          >
            <Text
              style={[
                styles.priorityBtnText,
                { color: priority === 'NORMAL' ? colors.textInverted : colors.textSecondary },
              ]}
            >
              Standard Transit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.priorityBtn,
              priority === 'EMERGENCY_STAT' && { backgroundColor: colors.danger },
            ]}
            onPress={() => setPriority('EMERGENCY_STAT')}
          >
            <MaterialCommunityIcons
              name="alarm-light"
              size={14}
              color={priority === 'EMERGENCY_STAT' ? colors.textInverted : colors.danger}
            />
            <Text
              style={[
                styles.priorityBtnText,
                { color: priority === 'EMERGENCY_STAT' ? colors.textInverted : colors.danger },
              ]}
            >
              STAT Emergency
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search 160+ SKUs (e.g. Paracetamol, Saline, Adrenaline)..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.catChip,
              {
                backgroundColor: selectedCat === c.value ? colors.primary : colors.bgCard,
                borderColor: selectedCat === c.value ? colors.primaryLight : colors.border,
              },
            ]}
            onPress={() => setSelectedCat(c.value)}
          >
            <Text
              style={[
                styles.catChipText,
                { color: selectedCat === c.value ? colors.textInverted : colors.textSecondary },
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Drug Catalog List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredDrugs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="pill-off" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No medications matching your query.
            </Text>
          </View>
        ) : (
          filteredDrugs.map((drug) => {
            const qty = quantities[drug.id] || 0;
            const isLow = drug.quantity <= drug.absoluteFloorUnits;

            return (
              <View
                key={drug.id}
                style={[
                  styles.drugCard,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                  qty > 0 && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.drugName, { color: colors.textPrimary }]}>{drug.name}</Text>
                    {drug.isHighRisk && (
                      <View style={[styles.highRiskPill, { backgroundColor: colors.dangerLight }]}>
                        <Text style={[styles.highRiskText, { color: colors.danger }]}>HIGH RISK</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.dosageText, { color: colors.textMuted }]}>{drug.dosage}</Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.priceTag, { color: colors.accent }]}>
                      ₹{drug.pricePerUnit.toFixed(2)} / {drug.unit}
                    </Text>
                    <Text
                      style={[
                        styles.stockIndicator,
                        { color: isLow ? colors.warning : colors.success },
                      ]}
                    >
                      {drug.quantity} {drug.unit} left
                    </Text>
                  </View>
                </View>

                {/* Counter buttons */}
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      { backgroundColor: colors.bgInput, borderColor: colors.border },
                      qty === 0 && { opacity: 0.4 },
                    ]}
                    onPress={() => handleUpdateQty(drug.id, -1)}
                    disabled={qty === 0}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>

                  <Text style={[styles.qtyNumber, { color: colors.textPrimary }]}>{qty}</Text>

                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: colors.primary, borderColor: colors.primaryDark }]}
                    onPress={() => handleUpdateQty(drug.id, 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={colors.textInverted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Sticky Bottom Order Bar */}
      {selectedCount > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.totalItemsText, { color: colors.textMuted }]}>
              {selectedCount} item{selectedCount > 1 ? 's' : ''} for Bed #{isPatient ? 12 : selectedBed}
            </Text>
            <Text style={[styles.totalPriceText, { color: colors.textPrimary }]}>
              Total: ₹{selectedTotalCost.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.dispatchBtn,
              { backgroundColor: priority === 'EMERGENCY_STAT' ? colors.danger : colors.primary },
            ]}
            onPress={handlePlaceOrder}
          >
            <MaterialCommunityIcons name="send" size={16} color={colors.textInverted} />
            <Text style={styles.dispatchBtnText}>
              {priority === 'EMERGENCY_STAT' ? 'DISPATCH STAT' : 'Dispatch Order'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  destinationCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  destHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  lockedPillText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  destSub: {
    fontSize: 11,
    marginTop: 4,
  },
  staffBedSelectorRow: {
    marginTop: Spacing.sm,
    gap: 8,
  },
  floorPicker: {},
  bedPicker: {},
  pickerLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  floorChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  priorityBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  catScroll: {
    maxHeight: 46,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  drugCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  drugName: {
    fontSize: 13,
    fontWeight: '700',
  },
  highRiskPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  highRiskText: {
    fontSize: 9,
    fontWeight: '800',
  },
  dosageText: {
    fontSize: 11,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockIndicator: {
    fontSize: 10,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: Spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumber: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  totalItemsText: {
    fontSize: 11,
  },
  totalPriceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  successSub: {
    fontSize: 11,
    marginTop: 2,
  },
  bannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
