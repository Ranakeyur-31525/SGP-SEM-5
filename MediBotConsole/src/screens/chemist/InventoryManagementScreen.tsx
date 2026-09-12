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
import { Header } from '../../components/common/Header';
import { Radius, Spacing } from '../../theme/tokens';
import { DrugItem } from '../../types';

export const InventoryManagementScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { isChemist, isAdmin, currentUser } = useRole();
  const {
    inventory,
    drugRequests,
    restockDrug,
    addNewDrugSku,
    approveDrugRequest,
    rejectDrugRequest,
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'REQUESTS' | 'NEW_SKU'>('STOCK');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<DrugItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('25');

  // New SKU Form state
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuDosage, setNewSkuDosage] = useState('');
  const [newSkuCategory, setNewSkuCategory] = useState<'CRITICAL_CARE' | 'ANTIBIOTIC' | 'ANALGESIC' | 'IV_FLUID' | 'EMERGENCY_CARDIAC'>('CRITICAL_CARE');
  const [newSkuQty, setNewSkuQty] = useState('50');
  const [newSkuFloor, setNewSkuFloor] = useState('20');
  const [newSkuPrice, setNewSkuPrice] = useState('120');

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isChemist && !isAdmin) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header subtitle="Pharmacy & Supply Chain Access" />
        <View style={styles.restrictedContainer}>
          <MaterialCommunityIcons name="shield-lock" size={64} color={theme.emergency} />
          <Text style={[styles.restrictedTitle, { color: theme.textPrimary }]}>
            Chemist Restricted Area
          </Text>
          <Text style={[styles.restrictedText, { color: theme.textSecondary }]}>
            Only licensed hospital chemists can add new medicines, restock quantities, or manage the drug catalog.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Return to Previous Screen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredInventory = inventory.filter(
    (d) =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const pendingRequests = drugRequests.filter((r) => r.status === 'PENDING');

  const handleRestock = (drugId: string, qtyToAdd: number) => {
    restockDrug(drugId, qtyToAdd);
    Alert.alert('Restock Successful', `Added +${qtyToAdd} units to stock.`);
  };

  const handleCreateSku = () => {
    if (!newSkuName.trim()) {
      Alert.alert('Missing Field', 'Please provide a medication name.');
      return;
    }

    const created = addNewDrugSku({
      name: newSkuName.trim(),
      dosage: newSkuDosage.trim() || 'Standard Formulation',
      category: newSkuCategory,
      quantity: parseInt(newSkuQty, 10) || 50,
      unit: 'vials',
      pricePerUnit: parseFloat(newSkuPrice) || 120.0,
      minThresholdPercent: 20,
      absoluteFloorUnits: parseInt(newSkuFloor, 10) || 20,
      isHighRisk: newSkuCategory === 'CRITICAL_CARE' || newSkuCategory === 'EMERGENCY_CARDIAC',
    });

    Alert.alert('SKU Created', `${created.name} (${created.id}) is now registered in the hospital formulary.`);
    setNewSkuName('');
    setNewSkuDosage('');
    setActiveTab('STOCK');
  };

  const handleApprove = (requestId: string) => {
    approveDrugRequest(requestId, currentUser.name);
    Alert.alert(
      'Proposal Approved',
      'The requested drug has been accepted and automatically registered as a new SKU in the hospital pharmacy catalog.'
    );
  };

  const handleConfirmReject = () => {
    if (!rejectingRequestId) return;
    rejectDrugRequest(
      rejectingRequestId,
      currentUser.name,
      rejectionReason.trim() || 'Formulary limit reached or therapeutic alternative exists.'
    );
    setRejectingRequestId(null);
    setRejectionReason('');
    Alert.alert('Proposal Rejected', 'Doctor has been notified with your comments.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header subtitle="Central Dispensary • Stock In & Drug Approvals" />

      {/* Segmented Top Navigation */}
      <View style={[styles.segmentBar, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'STOCK' && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
          ]}
          onPress={() => setActiveTab('STOCK')}
        >
          <MaterialCommunityIcons
            name="cube-send"
            size={16}
            color={activeTab === 'STOCK' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'STOCK' ? theme.primary : theme.textMuted, fontWeight: activeTab === 'STOCK' ? '700' : '500' },
            ]}
          >
            Inventory ({inventory.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'REQUESTS' && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
          ]}
          onPress={() => setActiveTab('REQUESTS')}
        >
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={16}
            color={activeTab === 'REQUESTS' ? theme.accent : theme.textMuted}
          />
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'REQUESTS' ? theme.accent : theme.textMuted, fontWeight: activeTab === 'REQUESTS' ? '700' : '500' },
            ]}
          >
            Doctor Queue ({pendingRequests.length})
          </Text>
          {pendingRequests.length > 0 && (
            <View style={[styles.pendingDot, { backgroundColor: theme.emergency }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'NEW_SKU' && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
          ]}
          onPress={() => setActiveTab('NEW_SKU')}
        >
          <MaterialCommunityIcons
            name="plus-box"
            size={16}
            color={activeTab === 'NEW_SKU' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'NEW_SKU' ? theme.primary : theme.textMuted, fontWeight: activeTab === 'NEW_SKU' ? '700' : '500' },
            ]}
          >
            + Add SKU
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: STOCK & RESTOCK */}
        {activeTab === 'STOCK' && (
          <View style={styles.tabSection}>
            {/* Search Filter */}
            <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Feather name="search" size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Search by drug name, code (DRG-001) or category..."
                placeholderTextColor={theme.textMuted}
                value={searchFilter}
                onChangeText={setSearchFilter}
              />
              {searchFilter.length > 0 && (
                <TouchableOpacity onPress={() => setSearchFilter('')}>
                  <Feather name="x" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.sectionCountText, { color: theme.textMuted }]}>
              Showing {filteredInventory.length} of {inventory.length} Hospital Pharmacy SKUs
            </Text>

            {filteredInventory.map((item) => {
              const isLow = item.quantity <= item.absoluteFloorUnits;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.drugCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isLow ? theme.emergency : theme.border,
                    },
                  ]}
                >
                  <View style={styles.drugCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.codeRow}>
                        <Text style={[styles.skuBadge, { backgroundColor: theme.surfaceElevated, color: theme.primary }]}>
                          {item.id}
                        </Text>
                        <Text style={[styles.categoryBadge, { color: theme.textMuted }]}>
                          {item.category.replace('_', ' ')}
                        </Text>
                        {item.isHighRisk && (
                          <View style={[styles.highRiskPill, { backgroundColor: theme.emergency + '22' }]}>
                            <Text style={[styles.highRiskText, { color: theme.emergency }]}>CRITICAL</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.drugName, { color: theme.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.drugDosage, { color: theme.textSecondary }]}>{item.dosage}</Text>
                    </View>

                    {/* Quantity Display */}
                    <View style={styles.qtyBox}>
                      <Text
                        style={[
                          styles.qtyValue,
                          { color: isLow ? theme.emergency : theme.success },
                        ]}
                      >
                        {item.quantity}
                      </Text>
                      <Text style={[styles.qtyUnit, { color: theme.textMuted }]}>{item.unit}</Text>
                      <Text style={[styles.qtyFloor, { color: theme.textMuted }]}>
                        Floor: {item.absoluteFloorUnits}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                  {/* Quick Restock Buttons (Chemist Only Action) */}
                  <View style={styles.restockRow}>
                    <Text style={[styles.restockLabel, { color: theme.textMuted }]}>Quick Restock:</Text>
                    <View style={styles.btnGroup}>
                      {[10, 25, 50].map((increment) => (
                        <TouchableOpacity
                          key={increment}
                          style={[styles.incrementBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                          onPress={() => handleRestock(item.id, increment)}
                        >
                          <Text style={[styles.incrementText, { color: theme.primary }]}>+{increment}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: DOCTOR DRUG APPROVAL QUEUE */}
        {activeTab === 'REQUESTS' && (
          <View style={styles.tabSection}>
            <View style={[styles.infoBanner, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="information" size={18} color={theme.accent} />
              <Text style={[styles.infoBannerText, { color: theme.textPrimary }]}>
                Doctors propose unlisted clinical drugs. Approving creates the SKU formally in the catalog.
              </Text>
            </View>

            {pendingRequests.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <MaterialCommunityIcons name="check-all" size={44} color={theme.success} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Pending Proposals</Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  All physician drug proposals have been reviewed and acted upon.
                </Text>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View
                  key={req.id}
                  style={[
                    styles.requestCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <View style={styles.reqHeader}>
                    <View style={[styles.reqBadge, { backgroundColor: theme.accent + '22', borderColor: theme.accent }]}>
                      <Text style={[styles.reqBadgeText, { color: theme.accent }]}>PROPOSAL {req.id}</Text>
                    </View>
                    <Text style={[styles.reqDate, { color: theme.textMuted }]}>{req.created_at}</Text>
                  </View>

                  <Text style={[styles.reqDrugName, { color: theme.textPrimary }]}>{req.drug_name}</Text>
                  <Text style={[styles.reqDosage, { color: theme.textSecondary }]}>
                    Dosage: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{req.recommended_dosage}</Text>
                  </Text>
                  <Text style={[styles.reqJustification, { color: theme.textMuted }]}>
                    Clinical Need: "{req.justification}"
                  </Text>
                  <Text style={[styles.reqDoctor, { color: theme.primary }]}>
                    Proposed by: {req.requested_by}
                  </Text>

                  <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                  {/* Approval / Rejection Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { backgroundColor: theme.emergency + '15', borderColor: theme.emergency }]}
                      onPress={() => {
                        setRejectingRequestId(req.id);
                        setRejectionReason('');
                      }}
                    >
                      <Feather name="x-circle" size={16} color={theme.emergency} />
                      <Text style={[styles.rejectBtnText, { color: theme.emergency }]}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: theme.accent }]}
                      onPress={() => handleApprove(req.id)}
                    >
                      <Feather name="check-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Accept & Create SKU</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* List already reviewed history */}
            <Text style={[styles.historyHeader, { color: theme.textPrimary }]}>Recently Processed Requests</Text>
            {drugRequests
              .filter((r) => r.status !== 'PENDING')
              .map((r) => (
                <View
                  key={r.id}
                  style={[styles.processedCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={styles.reqHeader}>
                    <Text style={[styles.processedTitle, { color: theme.textPrimary }]}>{r.drug_name}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: r.status === 'APPROVED' ? theme.success + '22' : theme.emergency + '22',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: r.status === 'APPROVED' ? theme.success : theme.emergency },
                        ]}
                      >
                        {r.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.processedSub, { color: theme.textMuted }]}>
                    Reviewed by {r.reviewed_by} at {r.reviewed_at || 'earlier today'}
                  </Text>
                  {r.rejection_reason && (
                    <Text style={[styles.rejectionComment, { color: theme.emergency }]}>
                      Reason: {r.rejection_reason}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* TAB 3: ADD NEW SKU DIRECTLY (CHEMIST PRIVILEGE) */}
        {activeTab === 'NEW_SKU' && (
          <View style={[styles.formContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.formHeaderTitle, { color: theme.textPrimary }]}>
              Register New Hospital Medication SKU
            </Text>
            <Text style={[styles.formHeaderSub, { color: theme.textSecondary }]}>
              Direct stock addition restricted to registered pharmacists and medical directors.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Drug Commercial / Generic Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. Dexamethasone 4mg/mL"
                placeholderTextColor={theme.textMuted}
                value={newSkuName}
                onChangeText={setNewSkuName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Dosage Formulation & Packaging</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. 2mL Ampoule / 100mL Vial"
                placeholderTextColor={theme.textMuted}
                value={newSkuDosage}
                onChangeText={setNewSkuDosage}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Initial Stock Units</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={newSkuQty}
                  onChangeText={setNewSkuQty}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Min Floor Reserve</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={newSkuFloor}
                  onChangeText={setNewSkuFloor}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Price (INR)</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={newSkuPrice}
                  onChangeText={setNewSkuPrice}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createSkuBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateSku}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus-circle" size={18} color="#FFFFFF" />
              <Text style={styles.createSkuBtnText}>Register in Hospital Catalog</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Reject Comments Modal */}
      <Modal visible={!!rejectingRequestId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Reject Drug Proposal</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Enter a clinical or administrative reason for declining this formulation:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border },
              ]}
              multiline
              numberOfLines={3}
              placeholder="e.g. Existing alternative in formulary or out of regulatory scope..."
              placeholderTextColor={theme.textMuted}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setRejectingRequestId(null)}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalRejectBtn, { backgroundColor: theme.emergency }]}
                onPress={handleConfirmReject}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm Rejection</Text>
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
  segmentBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  segmentText: {
    fontSize: 11,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  tabSection: {
    gap: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  sectionCountText: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  drugCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  drugCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  skuBadge: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  highRiskPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  highRiskText: {
    fontSize: 8,
    fontWeight: '800',
  },
  drugName: {
    fontSize: 14,
    fontWeight: '700',
  },
  drugDosage: {
    fontSize: 11,
    marginTop: 2,
  },
  qtyBox: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  qtyUnit: {
    fontSize: 10,
  },
  qtyFloor: {
    fontSize: 9,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  restockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restockLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  incrementBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  incrementText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  infoBannerText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
  },
  requestCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  reqBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  reqDate: {
    fontSize: 10,
  },
  reqDrugName: {
    fontSize: 15,
    fontWeight: '700',
  },
  reqDosage: {
    fontSize: 12,
    marginTop: 2,
  },
  reqJustification: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reqDoctor: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  processedCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  processedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  processedSub: {
    fontSize: 10,
    marginTop: 2,
  },
  rejectionComment: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  formContainer: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  formHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  formHeaderSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputField: {
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
  },
  createSkuBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  createSkuBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  restrictedText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  modalInput: {
    height: 80,
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: Spacing.sm,
    fontSize: 12,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  modalRejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
});
