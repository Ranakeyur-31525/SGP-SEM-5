import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Image, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { usePharmacyOrderStore } from '../../stores/usePharmacyOrderStore';
import { PharmacyOrder, PharmacyOrderItem } from '../../types';

interface ChemistDashboardProps {
  navigation: any;
}

export const ChemistDashboard: React.FC<ChemistDashboardProps> = ({ navigation }) => {
  const { deliveries } = useDeliveryStore();
  const { inventory, getLowStockItems } = useInventoryStore();
  const { orders, submitCalculation } = usePharmacyOrderStore();

  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [calculationItems, setCalculationItems] = useState<PharmacyOrderItem[]>([
    { name: '', price: 0 },
  ]);

  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'ORDER_PLACED' || d.status === 'CHEMIST_LOADED'
  );
  const lowStockItems = getLowStockItems();

  const handleOpenCalculation = (order: PharmacyOrder) => {
    setSelectedOrder(order);
    if (order.items_list && order.items_list.length > 0) {
      setCalculationItems(
        order.items_list.map((name) => ({ name, price: 150 }))
      );
    } else {
      setCalculationItems([{ name: 'Standard Medication Kit', price: 250 }]);
    }
  };

  const handleAddItemRow = () => {
    setCalculationItems([...calculationItems, { name: '', price: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setCalculationItems(calculationItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'name' | 'price', val: any) => {
    const updated = [...calculationItems];
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' ? parseFloat(val) || 0 : val,
    };
    setCalculationItems(updated);
  };

  const handleCalculateSubmit = () => {
    if (!selectedOrder) return;
    const valid = calculationItems.filter((item) => item.name.trim() !== '' && item.price > 0);
    if (valid.length === 0) {
      alert('Please enter at least one item with a valid medicine name and price.');
      return;
    }

    submitCalculation(selectedOrder.order_id, valid);
    alert(`Order ${selectedOrder.order_id} calculated! Costs added to Bed ${selectedOrder.patient_bed} billing ledger.`);
    setSelectedOrder(null);
  };

  return (
    <View style={styles.container}>
      {/* Dispensary Status Banner */}
      <View style={styles.dispensaryCard}>
        <View style={styles.dispHeader}>
          <View>
            <Text style={styles.dispTitle}>Central Drug Dispensary Hub</Text>
            <Text style={styles.dispSub}>Pharmacist: Rahul Verma (R.Ph) • 160+ Master SKUs</Text>
          </View>
          <View style={styles.chemistBadge}>
            <MaterialCommunityIcons name="pill" size={16} color={Colors.primary} />
            <Text style={styles.chemistBadgeText}>PHARMACY ACTIVE</Text>
          </View>
        </View>

        {/* Primary Chemist Action: Dispatch Robot */}
        <TouchableOpacity
          style={styles.dispatchBtn}
          onPress={() => navigation.navigate('DeliveryCreate')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="truck-delivery" size={24} color="#FFFFFF" />
          <View style={styles.dispatchBtnTextGroup}>
            <Text style={styles.dispatchBtnTitle}>LOAD PAYLOAD & DISPATCH ROBOT</Text>
            <Text style={styles.dispatchBtnSub}>Fill compartment for Bed 1 - 50 and set 4-digit PIN</Text>
          </View>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Stock In & Doctor Drug Proposal Queue */}
        <TouchableOpacity
          style={[styles.dispatchBtn, { backgroundColor: '#0D9488', marginTop: 8 }]}
          onPress={() => navigation.navigate('InventoryManagement')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="store-cog" size={24} color="#FFFFFF" />
          <View style={styles.dispatchBtnTextGroup}>
            <Text style={styles.dispatchBtnTitle}>RESTOCK & DOCTOR PROPOSAL QUEUE</Text>
            <Text style={styles.dispatchBtnSub}>Chemist stock-in, quantity increments, review proposals</Text>
          </View>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Metrics Row: Incoming Patient Orders & Low Stock */}
      <View style={styles.metricsRow}>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Rx Order Queue"
            value={orders.filter((o) => o.order_status === 'pending').length}
            unit="Intakes"
            badgeLabel={orders.some((o) => o.order_status === 'pending') ? 'PENDING' : 'CLEAR'}
            badgeVariant={orders.some((o) => o.order_status === 'pending') ? 'warning' : 'success'}
            icon={<MaterialCommunityIcons name="clipboard-text-clock" size={16} color={Colors.warning} />}
          />
        </View>
        <View style={styles.metricHalf}>
          <MetricCard
            title="Low Stock SKUs"
            value={lowStockItems.length}
            unit="Deficits"
            badgeLabel={lowStockItems.length > 0 ? 'ALERT' : 'OPTIMAL'}
            badgeVariant={lowStockItems.length > 0 ? 'danger' : 'success'}
            icon={<MaterialCommunityIcons name="alert-decagram" size={16} color={Colors.danger} />}
          />
        </View>
      </View>

      {/* 1. Pharmacy Order Intake Queue (Parity with ChemistDashboard.jsx from MEDIBOT) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderGroup}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Pharmacy Order Intake Queue</Text>
          </View>
          <Text style={styles.cardBadge}>{orders.length} Requests</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="check-circle" size={20} color={Colors.success} />
            <Text style={styles.emptyText}>No incoming patient orders in queue.</Text>
          </View>
        ) : (
          orders.map((o) => (
            <View key={o.order_id} style={styles.orderQueueItem}>
              <View style={styles.orderQueueTop}>
                <View>
                  <Text style={styles.orderQueueId}>{o.order_id}</Text>
                  <Text style={styles.orderQueuePatient}>
                    {o.patient_name} • Floor {o.patient_floor} / Bed {o.patient_bed}
                  </Text>
                </View>
                <StatusBadge
                  label={o.order_status.toUpperCase()}
                  variant={o.order_status === 'completed' ? 'success' : 'warning'}
                  size="sm"
                />
              </View>

              <Text style={styles.orderQueueItems}>
                Type: {o.order_type === 'prescription_upload' ? '📸 Prescription' : '📝 Text List'} •{' '}
                {o.items_list.join(', ')}
              </Text>

              <View style={styles.orderQueueBottom}>
                <Text style={styles.orderQueueSubtotal}>
                  {o.subtotal > 0 ? `Subtotal: ₹${o.subtotal.toFixed(2)}` : 'Awaiting Calculation'}
                </Text>

                {o.order_status === 'pending' || o.order_status === 'processing' ? (
                  <TouchableOpacity
                    style={styles.processBtn}
                    onPress={() => handleOpenCalculation(o)}
                  >
                    <Feather name="edit-2" size={12} color={Colors.textInverted} />
                    <Text style={styles.processBtnText}>✏️ Process & Price</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.dispatchFromOrderBtn}
                    onPress={() =>
                      navigation.navigate('DeliveryCreate', {
                        defaultPriority: 'NORMAL',
                      })
                    }
                  >
                    <MaterialCommunityIcons name="robot" size={13} color={Colors.textInverted} />
                    <Text style={styles.dispatchFromOrderBtnText}>Dispatch Bot</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* 2. Side Calculation Workspace Modal (Matching MEDIBOT Chemist calculation) */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calcModal}>
            <View style={styles.calcHeader}>
              <View>
                <Text style={styles.calcTitle}>Process Calculation</Text>
                <Text style={styles.calcSub}>
                  {selectedOrder?.patient_name} • Floor {selectedOrder?.patient_floor} / Bed {selectedOrder?.patient_bed}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Prescription Preview if present */}
            {selectedOrder?.order_type === 'prescription_upload' && selectedOrder.prescription_image_url ? (
              <View style={styles.modalRxBox}>
                <Text style={styles.inputLabel}>Prescription Image Document:</Text>
                <Image
                  source={{ uri: selectedOrder.prescription_image_url }}
                  style={styles.modalRxImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {/* Itemized Medicine Price Inputs */}
            <Text style={styles.inputLabel}>Itemized Medicine Prices:</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {calculationItems.map((item, idx) => (
                <View key={idx} style={styles.calcItemRow}>
                  <TextInput
                    style={styles.calcNameInput}
                    placeholder="Medicine Name"
                    placeholderTextColor={Colors.textMuted}
                    value={item.name}
                    onChangeText={(v) => handleItemChange(idx, 'name', v)}
                  />
                  <TextInput
                    style={styles.calcPriceInput}
                    placeholder="Price (₹)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={item.price ? item.price.toString() : ''}
                    onChangeText={(v) => handleItemChange(idx, 'price', v)}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveItemRow(idx)}
                    disabled={calculationItems.length === 1}
                    style={styles.calcRemoveBtn}
                  >
                    <Text style={styles.calcRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.calcAddRowBtn} onPress={handleAddItemRow}>
                <Feather name="plus" size={13} color={Colors.primary} />
                <Text style={styles.calcAddRowText}>Add Item Row</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.calcTotalRow}>
              <Text style={styles.calcTotalLabel}>Estimated Subtotal:</Text>
              <Text style={styles.calcTotalVal}>
                ₹{calculationItems.reduce((acc, curr) => acc + (curr.price || 0), 0).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity style={styles.calcSubmitBtn} onPress={handleCalculateSubmit}>
              <Feather name="check-circle" size={16} color={Colors.textInverted} />
              <Text style={styles.calcSubmitBtnText}>Submit Order & Calculate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chemist Quick Tiles */}
      <View style={styles.tilesRow}>
        <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Inventory')}>
          <MaterialCommunityIcons name="pill-multiple" size={24} color={Colors.primary} />
          <Text style={styles.tileTitle}>160+ Inventory</Text>
          <Text style={styles.tileSub}>Catalog & Pricing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('LowStock')}>
          <MaterialCommunityIcons name="alert-decagram" size={24} color={Colors.warning} />
          <Text style={styles.tileTitle}>Dual Low-Stock</Text>
          <Text style={styles.tileSub}>&lt;20% & Floor Units</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('History')}>
          <Feather name="archive" size={24} color={Colors.info} />
          <Text style={styles.tileTitle}>Fulfillment Logs</Text>
          <Text style={styles.tileSub}>Audit & CSV Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  dispensaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dispHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dispTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  dispSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chemistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chemistBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  dispatchBtnTextGroup: {
    flex: 1,
  },
  dispatchBtnTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textInverted,
    letterSpacing: 0.3,
  },
  dispatchBtnSub: {
    fontSize: 10,
    color: 'rgba(10, 17, 40, 0.85)',
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  emptyText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  queueItem: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgSurfaceLight,
    marginBottom: Spacing.xs,
  },
  queueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queueOrderNum: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: Colors.primary,
  },
  queueDestination: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  queuePrescribed: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  queueMeds: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginVertical: 3,
  },
  loadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.primaryDark,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginTop: 2,
  },
  loadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tile: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  tileSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  orderQueueItem: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  orderQueueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderQueueId: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  orderQueuePatient: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  orderQueueItems: {
    fontSize: 11,
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  orderQueueBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderQueueSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  processBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1', // Indigo from MEDIBOT
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  processBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dispatchFromOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  dispatchFromOrderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textInverted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  calcModal: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '90%',
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  calcSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalRxBox: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  modalRxImage: {
    width: '100%',
    height: 140,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  calcItemRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 6,
  },
  calcNameInput: {
    flex: 2,
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  calcPriceInput: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  calcRemoveBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  calcRemoveText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.danger,
  },
  calcAddRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  calcAddRowText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  calcTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  calcTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  calcTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: Colors.success,
  },
  calcSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  calcSubmitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
