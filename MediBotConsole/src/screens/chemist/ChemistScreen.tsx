import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useInventoryStore } from '../../stores/useInventoryStore';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { DrugApprovalRequest, DrugItem, DeliveryPriority } from '../../types';

type ChemistTab = 'PROPOSALS' | 'DISPENSARY' | 'DISPATCH' | 'LOW_STOCK';

export const ChemistScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuthStore();
  const {
    inventory,
    drugRequests,
    approveDrugRequest,
    rejectDrugRequest,
    restockDrug,
    getLowStockItems,
  } = useInventoryStore();
  const { deliveries, createDelivery } = useDeliveryStore();

  const [activeTab, setActiveTab] = useState<ChemistTab>('PROPOSALS');

  // Dispatch Bot Form State
  const [dispatchFloor, setDispatchFloor] = useState<number>(2);
  const [dispatchBed, setDispatchBed] = useState<number>(12);
  const [dispatchPriority, setDispatchPriority] = useState<DeliveryPriority>('NORMAL');
  const [customPasscode, setCustomPasscode] = useState<string>('4821');
  const [selectedMeds, setSelectedMeds] = useState<Array<{ drug: DrugItem; quantity: number }>>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Requisition feedback
  const [requisitionSent, setRequisitionSent] = useState<string | null>(null);

  const pendingProposals = drugRequests.filter((r) => r.status === 'PENDING');
  const lowStockItems = getLowStockItems();

  const handleApproveProposal = (req: DrugApprovalRequest) => {
    approveDrugRequest(req.id, currentUser.name);
    Alert.alert(
      'Proposal Approved & Cataloged',
      `Medication "${req.drug_name}" has been added to hospital inventory catalog with 20 initial stock units. Ready for bedside dispatch.`
    );
  };

  const handleOrderProposal = (req: DrugApprovalRequest) => {
    approveDrugRequest(req.id, currentUser.name);
    const existingDrug = inventory.find(
      (d) => d.name.toLowerCase() === req.drug_name.toLowerCase()
    );
    const targetDrug = existingDrug || {
      id: `DRG-${Date.now().toString().slice(-4)}`,
      name: req.drug_name,
      category: req.category as any,
      quantity: 20,
      safetyLeadTimeDays: 2,
      absoluteFloorUnits: 5,
      unitPrice: 150,
      requiresColdChain: false,
    };
    setSelectedMeds([{ drug: targetDrug as DrugItem, quantity: 1 }]);
    setActiveTab('DISPATCH');
    Alert.alert(
      'Medical Proposal Selected for Order',
      `"${req.drug_name}" approved and loaded into MEDIBOT dispatch chamber. Select Floor & Bed to launch delivery.`
    );
  };

  const handleRejectProposal = (req: DrugApprovalRequest) => {
    rejectDrugRequest(req.id, currentUser.name, 'Formulary alternative available or regulatory restriction.');
    Alert.alert('Proposal Declined', `Medication request "${req.drug_name}" marked as rejected.`);
  };

  const handleToggleMed = (drug: DrugItem) => {
    const exists = selectedMeds.find((m) => m.drug.id === drug.id);
    if (exists) {
      setSelectedMeds(selectedMeds.filter((m) => m.drug.id !== drug.id));
    } else {
      setSelectedMeds([...selectedMeds, { drug, quantity: 1 }]);
    }
  };

  const handleLaunchMission = () => {
    if (selectedMeds.length === 0) {
      Alert.alert('Empty Compartment', 'Please select at least one medication to load into the MEDIBOT delivery chamber.');
      return;
    }
    if (!customPasscode || customPasscode.length !== 4) {
      Alert.alert('Invalid Passcode', 'Please enter a 4-digit numeric verification passcode for the SG90 deadbolt.');
      return;
    }

    const order = createDelivery({
      targetFloor: dispatchFloor,
      targetBed: dispatchBed,
      priority: dispatchPriority,
      items: selectedMeds,
      prescribedBy: `Dispensary Pharmacist: ${currentUser.name}`,
    });

    Alert.alert(
      'MEDIBOT Dispatched!',
      `Mission ${order.orderNumber} initiated for Floor ${dispatchFloor}, Bed ${dispatchBed}. SG90 passcode: ${order.passcode}. Telemetry live.`,
      [
        {
          text: 'Monitor Mission',
          onPress: () => navigation.navigate('DeliveryDetail', { deliveryId: order.id }),
        },
      ]
    );

    setSelectedMeds([]);
  };

  const handleQuickRequisition = (drugName: string) => {
    setRequisitionSent(`PO Purchase Order generated for ${drugName} (+50 units). Sent to hospital procurement vendor.`);
    setTimeout(() => setRequisitionSent(null), 4000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header subtitle="Central Drug Dispensary & Logistics Desk" showBack={true} />

      {/* 4 Core Segmental Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'PROPOSALS' && [styles.tabItemActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('PROPOSALS')}
        >
          <View style={styles.tabBadgeRow}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'PROPOSALS' ? colors.primary : colors.textSecondary },
              ]}
            >
              Proposals
            </Text>
            {pendingProposals.length > 0 && (
              <View style={[styles.countPill, { backgroundColor: colors.danger }]}>
                <Text style={styles.countText}>{pendingProposals.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'DISPENSARY' && [styles.tabItemActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('DISPENSARY')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'DISPENSARY' ? colors.primary : colors.textSecondary },
            ]}
          >
            Dispensary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'DISPATCH' && [styles.tabItemActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('DISPATCH')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'DISPATCH' ? colors.primary : colors.textSecondary },
            ]}
          >
            Dispatch Bot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'LOW_STOCK' && [styles.tabItemActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('LOW_STOCK')}
        >
          <View style={styles.tabBadgeRow}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'LOW_STOCK' ? colors.primary : colors.textSecondary },
              ]}
            >
              Low Stock
            </Text>
            {lowStockItems.length > 0 && (
              <View style={[styles.countPill, { backgroundColor: colors.warning }]}>
                <Text style={styles.countText}>{lowStockItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: MEDICAL PROPOSALS FEED */}
        {activeTab === 'PROPOSALS' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Medical Drug Proposals Queue
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Incoming drug recommendations from Attending Physicians & Floor Nurses
                </Text>
              </View>
            </View>

            {pendingProposals.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Feather name="check-circle" size={32} color={colors.success} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Pending Drug Proposals</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  All physician proposals have been reviewed, approved, or cataloged.
                </Text>
              </View>
            ) : (
              pendingProposals.map((item) => (
                <View
                  key={item.id}
                  style={[styles.proposalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.proposalHeader}>
                    <View style={styles.proposalTitleGroup}>
                      <MaterialCommunityIcons name="pill" size={20} color={colors.primary} />
                      <Text style={[styles.drugNameText, { color: colors.textPrimary }]}>{item.drug_name}</Text>
                    </View>
                    <StatusBadge label="PENDING REVIEW" variant="warning" size="sm" />
                  </View>

                  <Text style={[styles.proposalDosage, { color: colors.primary }]}>
                    Dosage: {item.recommended_dosage} • Category: {item.category}
                  </Text>

                  <View style={[styles.justificationBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Text style={[styles.justificationLabel, { color: colors.textSecondary }]}>CLINICAL JUSTIFICATION:</Text>
                    <Text style={[styles.justificationText, { color: colors.textPrimary }]}>{item.justification}</Text>
                  </View>

                  <Text style={[styles.requestMeta, { color: colors.textMuted }]}>
                    Submitted by: {item.requested_by} ({item.requested_by_role}) at {item.created_at}
                  </Text>

                  <View style={styles.proposalActionRow}>
                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: colors.primary, flex: 1.3 }]}
                      onPress={() => handleOrderProposal(item)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Order & Dispatch Bot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: colors.success, flex: 1 }]}
                      onPress={() => handleApproveProposal(item)}
                      activeOpacity={0.85}
                    >
                      <Feather name="check" size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rejectBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
                      onPress={() => handleRejectProposal(item)}
                      activeOpacity={0.85}
                    >
                      <Feather name="x" size={15} color={colors.danger} />
                      <Text style={[styles.rejectBtnText, { color: colors.danger }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: DISPENSARY MANAGEMENT */}
        {activeTab === 'DISPENSARY' && (
          <View style={styles.tabSection}>
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search master formulary (160+ SKUs)..."
                placeholderTextColor={colors.textMuted}
                value={searchFilter}
                onChangeText={setSearchFilter}
              />
              {searchFilter !== '' && (
                <TouchableOpacity onPress={() => setSearchFilter('')}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.skuGrid}>
              {inventory
                .filter(
                  (d) =>
                    d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    d.id.toLowerCase().includes(searchFilter.toLowerCase())
                )
                .slice(0, 20)
                .map((d) => (
                  <View
                    key={d.id}
                    style={[styles.skuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.skuTopRow}>
                      <Text style={[styles.skuCode, { color: colors.primary }]}>{d.id}</Text>
                      <Text style={[styles.skuQty, { color: d.quantity <= d.absoluteFloorUnits ? colors.danger : colors.success }]}>
                        {d.quantity} {d.unit}
                      </Text>
                    </View>
                    <Text style={[styles.skuName, { color: colors.textPrimary }]}>{d.name}</Text>
                    <Text style={[styles.skuDosage, { color: colors.textSecondary }]}>{d.dosage}</Text>
                    <Text style={[styles.skuPrice, { color: colors.textMuted }]}>₹{d.pricePerUnit} / unit</Text>

                    <TouchableOpacity
                      style={[styles.restockBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                      onPress={() => {
                        restockDrug(d.id, 25);
                        Alert.alert('Restock Successful', `Added +25 units to ${d.name}. New total: ${d.quantity + 25}`);
                      }}
                    >
                      <Feather name="plus-circle" size={13} color={colors.primary} />
                      <Text style={[styles.restockBtnText, { color: colors.primary }]}>+25 Units Restock</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* TAB 3: DISPATCH BOT LAUNCHPAD */}
        {activeTab === 'DISPATCH' && (
          <View style={styles.tabSection}>
            <View style={[styles.dispatchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.dispatchHeader}>
                <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.dispatchTitle, { color: colors.textPrimary }]}>Autonomous Mission Launchpad</Text>
                  <Text style={[styles.dispatchSub, { color: colors.textSecondary }]}>
                    Load physical cargo compartment & configure destination
                  </Text>
                </View>
              </View>

              {/* Target Floor */}
              <Text style={[styles.stepTitle, { color: colors.textSecondary }]}>1. SELECT WARD FLOOR (1 - 5):</Text>
              <View style={styles.buttonRow}>
                {[1, 2, 3, 4, 5].map((fl) => (
                  <TouchableOpacity
                    key={fl}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor: dispatchFloor === fl ? colors.primary : colors.surfaceElevated,
                        borderColor: dispatchFloor === fl ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setDispatchFloor(fl);
                      setDispatchBed((fl - 1) * 10 + 1);
                    }}
                  >
                    <Text style={[styles.choiceBtnText, { color: dispatchFloor === fl ? '#FFFFFF' : colors.textPrimary }]}>
                      Floor {fl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Target Bed */}
              <Text style={[styles.stepTitle, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                2. SELECT BED ON FLOOR {dispatchFloor} ({(dispatchFloor - 1) * 10 + 1} - {dispatchFloor * 10}):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bedScroll}>
                {Array.from({ length: 10 }, (_, i) => (dispatchFloor - 1) * 10 + i + 1).map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.bedPill,
                      {
                        backgroundColor: dispatchBed === b ? colors.primary : colors.surfaceElevated,
                        borderColor: dispatchBed === b ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDispatchBed(b)}
                  >
                    <Text style={[styles.bedPillText, { color: dispatchBed === b ? '#FFFFFF' : colors.textPrimary }]}>
                      Bed {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 4-Digit PIN */}
              <Text style={[styles.stepTitle, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                3. SET SG90 SERVO 4-DIGIT VERIFICATION PASSCODE:
              </Text>
              <View style={styles.pinRow}>
                <TextInput
                  style={[
                    styles.pinInput,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.primary,
                    },
                  ]}
                  value={customPasscode}
                  onChangeText={(val) => setCustomPasscode(val.slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <TouchableOpacity
                  style={[styles.randomPinBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => setCustomPasscode(String(Math.floor(1000 + Math.random() * 9000)))}
                >
                  <Feather name="refresh-cw" size={14} color={colors.primary} />
                  <Text style={[styles.randomPinText, { color: colors.primary }]}>Generate Random</Text>
                </TouchableOpacity>
              </View>

              {/* Medicine Select */}
              <Text style={[styles.stepTitle, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                4. SELECT MEDICATIONS TO LOAD ({selectedMeds.length} Items Selected):
              </Text>
              <ScrollView style={styles.medSelectScroll} nestedScrollEnabled>
                {inventory.slice(0, 15).map((d) => {
                  const isSelected = selectedMeds.some((m) => m.drug.id === d.id);
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.medSelectRow,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surfaceElevated,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleToggleMed(d)}
                    >
                      <Feather
                        name={isSelected ? 'check-square' : 'square'}
                        size={18}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.medSelectName, { color: colors.textPrimary }]}>{d.name}</Text>
                        <Text style={[styles.medSelectSub, { color: colors.textSecondary }]}>
                          {d.dosage} • Stock: {d.quantity}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Final Dispatch Button */}
              <TouchableOpacity
                style={[styles.launchMissionBtn, { backgroundColor: colors.primary }]}
                onPress={handleLaunchMission}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFFFFF" />
                <Text style={styles.launchBtnText}>
                  ENGAGE ESP32 TRANSIT TO BED {dispatchBed}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: LOW STOCK REQUISITIONS */}
        {activeTab === 'LOW_STOCK' && (
          <View style={styles.tabSection}>
            {requisitionSent && (
              <View style={[styles.alertBanner, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.alertBannerText, { color: colors.success }]}>{requisitionSent}</Text>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Dual-Threshold Inventory Warnings
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Triggered when units ≤ absolute floor or stock ≤ 20% capacity
                </Text>
              </View>
            </View>

            {lowStockItems.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Feather name="check" size={32} color={colors.success} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All Stock Levels Healthy</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  No items below critical floor thresholds.
                </Text>
              </View>
            ) : (
              lowStockItems.map(({ drug, triggerReason }) => (
                <View
                  key={drug.id}
                  style={[styles.lowStockCard, { backgroundColor: colors.surface, borderColor: colors.danger }]}
                >
                  <View style={styles.lowStockTop}>
                    <View>
                      <Text style={[styles.lowStockName, { color: colors.textPrimary }]}>{drug.name}</Text>
                      <Text style={[styles.lowStockReason, { color: colors.danger }]}>{triggerReason}</Text>
                    </View>
                    <View style={[styles.unitsBadge, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                      <Text style={[styles.unitsText, { color: colors.danger }]}>
                        {drug.quantity} {drug.unit} left
                      </Text>
                    </View>
                  </View>

                  <View style={styles.lowStockBottom}>
                    <Text style={[styles.thresholdMeta, { color: colors.textMuted }]}>
                      Floor limit: {drug.absoluteFloorUnits} • Min %: {drug.minThresholdPercent}%
                    </Text>
                    <TouchableOpacity
                      style={[styles.requisitionBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleQuickRequisition(drug.name)}
                    >
                      <Feather name="send" size={12} color="#FFFFFF" />
                      <Text style={styles.requisitionBtnText}>1-Tap Purchase Requisition</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  countText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  tabSection: {
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  proposalCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proposalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  drugNameText: {
    fontSize: 13,
    fontWeight: '800',
  },
  proposalDosage: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  justificationBox: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  justificationLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  justificationText: {
    fontSize: 11,
    lineHeight: 16,
  },
  requestMeta: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  proposalActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
  },
  skuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skuCard: {
    width: '48%',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
  },
  skuTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skuCode: {
    fontSize: 10,
    fontWeight: '800',
  },
  skuQty: {
    fontSize: 10,
    fontWeight: '800',
  },
  skuName: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  skuDosage: {
    fontSize: 10,
    marginTop: 2,
  },
  skuPrice: {
    fontSize: 10,
    marginTop: 2,
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: 6,
  },
  restockBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dispatchCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  dispatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dispatchTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  dispatchSub: {
    fontSize: 11,
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  choiceBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bedScroll: {
    flexDirection: 'row',
  },
  bedPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginRight: 6,
  },
  bedPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pinRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  pinInput: {
    width: 100,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  randomPinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  randomPinText: {
    fontSize: 11,
    fontWeight: '800',
  },
  medSelectScroll: {
    maxHeight: 180,
    marginVertical: 6,
  },
  medSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: 4,
  },
  medSelectName: {
    fontSize: 11,
    fontWeight: '800',
  },
  medSelectSub: {
    fontSize: 9,
  },
  launchMissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  launchBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  alertBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lowStockCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
  },
  lowStockTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lowStockName: {
    fontSize: 13,
    fontWeight: '800',
  },
  lowStockReason: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  unitsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  unitsText: {
    fontSize: 10,
    fontWeight: '800',
  },
  lowStockBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  thresholdMeta: {
    fontSize: 10,
  },
  requisitionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  requisitionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
