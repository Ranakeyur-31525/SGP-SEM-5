import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { useBillingStore } from '../../stores/useBillingStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

export const BillingScreen = ({ route }: any) => {
  const { colors } = useTheme();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser.role === 'ADMIN';
  const isDoctor = currentUser.role === 'DOCTOR';
  const isPatient = currentUser.role === 'PATIENT';
  const patientBed = currentUser.assignedBed || 12;

  const initialBed = isPatient ? patientBed : (route?.params?.bedNumber || 12);
  const [selectedFloor, setSelectedFloor] = useState<number>(Math.ceil(initialBed / 10) || 2);
  const [selectedBed, setSelectedBed] = useState<number>(initialBed);
  const [invoicePreviewVisible, setInvoicePreviewVisible] = useState<boolean>(false);
  const [doctorRequestModalVisible, setDoctorRequestModalVisible] = useState<boolean>(false);
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient vitals stable (BP 120/80, HR 72, SpO2 99%). Post-procedure recovery complete. Cleared for discharge.'
  );

  const {
    getBillForBed,
    dischargeAndSettle,
    getDischargeRequestForBed,
    requestDischarge,
    approveAndDischarge,
  } = useBillingStore();

  const activeBedToDisplay = isPatient ? patientBed : selectedBed;
  const bill = getBillForBed(activeBedToDisplay);
  const pendingRequest = getDischargeRequestForBed(activeBedToDisplay);

  const floorBeds = Array.from({ length: 10 }, (_, i) => (selectedFloor - 1) * 10 + i + 1);

  const handleSelectFloor = (f: number) => {
    setSelectedFloor(f);
    const minBed = (f - 1) * 10 + 1;
    const maxBed = f * 10;
    if (selectedBed < minBed || selectedBed > maxBed) {
      setSelectedBed(minBed);
    }
  };

  const handleAdminSettle = () => {
    if (!isAdmin) {
      Alert.alert(
        'Permission Restricted',
        'Hospital Governance: Only Facility Administrators can finalize patient discharge. Doctors can only submit discharge requests.'
      );
      return;
    }

    if (pendingRequest) {
      const res = approveAndDischarge(pendingRequest.id, currentUser.role);
      Alert.alert(res.success ? 'Discharge Finalized' : 'Error', res.message);
    } else {
      const res = dischargeAndSettle(activeBedToDisplay, currentUser.role);
      Alert.alert(res.success ? 'Discharge Finalized' : 'Error', res.message);
    }
    setInvoicePreviewVisible(false);
  };

  const handleDoctorSubmitRequest = () => {
    if (!clinicalNotes.trim()) {
      Alert.alert('Clinical Notes Required', 'Please enter a brief clinical discharge recommendation.');
      return;
    }

    const res = requestDischarge(
      activeBedToDisplay,
      currentUser.name,
      clinicalNotes.trim(),
      currentUser.department || 'Attending Physician'
    );
    setDoctorRequestModalVisible(false);
    Alert.alert('Discharge Request Submitted', res.message);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgDark }]}>
      <Header
        subtitle={
          isPatient
            ? `Bed ${patientBed} Inpatient Invoice & Pharmacy Ledger`
            : 'Itemized Patient Billing & Logistics Invoicing'
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STAFF/ADMIN VIEW: 2-Tier Floor & Bed Selector */}
        {!isPatient ? (
          <View style={[styles.bedPickerCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.pickerHeaderRow}>
              <MaterialCommunityIcons name="hospital-building" size={18} color={colors.primary} />
              <Text style={[styles.bedPickerTitle, { color: colors.textPrimary }]}>
                Facility Bed Location Selector (1 - 50)
              </Text>
            </View>

            {/* 1. Floor Selector */}
            <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
              Step 1: Select Hospital Floor
            </Text>
            <View style={styles.floorButtonsRow}>
              {[1, 2, 3, 4, 5].map((f) => {
                const isActive = selectedFloor === f;
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

            {/* 2. Beds of Selected Floor Only */}
            <Text style={[styles.stepLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              Step 2: Select Bed on Floor {selectedFloor} (Beds {(selectedFloor - 1) * 10 + 1} -{' '}
              {selectedFloor * 10})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bedScroll}>
              {floorBeds.map((b) => {
                const isActive = selectedBed === b;
                return (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.bedChip,
                      {
                        backgroundColor: isActive ? colors.primary : colors.bgDark,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedBed(b)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.bedChipText,
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
        ) : (
          <View
            style={[
              styles.patientBedNotice,
              { backgroundColor: colors.infoLight, borderColor: colors.primary },
            ]}
          >
            <MaterialCommunityIcons name="shield-account" size={20} color={colors.primary} />
            <Text style={[styles.patientBedNoticeText, { color: colors.textPrimary }]}>
              Inpatient Ledger Locked to Your Assigned Bed {patientBed}
            </Text>
          </View>
        )}

        {/* Clinical Discharge Status Banner */}
        {pendingRequest ? (
          <View
            style={[
              styles.dischargeStatusBanner,
              { backgroundColor: colors.warningLight, borderColor: colors.warning },
            ]}
          >
            <MaterialCommunityIcons name="clock-alert-outline" size={22} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: colors.warning }]}>
                DISCHARGE RECOMMENDATION PENDING ADMIN CLEARANCE
              </Text>
              <Text style={[styles.statusBannerText, { color: colors.textPrimary }]}>
                Requested by: <Text style={{ fontWeight: '700' }}>{pendingRequest.doctorName}</Text> (
                {pendingRequest.recommendedAt})
              </Text>
              <Text style={[styles.statusBannerNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                Clinical Note: {pendingRequest.clinicalSummary}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.dischargeStatusBanner,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name="account-clock" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: colors.primary }]}>
                INPATIENT CLINICAL STATUS: ACTIVE ADMISSION
              </Text>
              <Text style={[styles.statusBannerText, { color: colors.textSecondary }]}>
                Patient: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{bill.patientName}</Text> • Bed #{activeBedToDisplay}
              </Text>
            </View>
          </View>
        )}

        {/* Patient Ledger Overview Card */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.patientName, { color: colors.textPrimary }]}>{bill.patientName}</Text>
              <Text style={[styles.patientSub, { color: colors.textMuted }]}>
                MRN: {bill.patientId} • Floor {Math.ceil(activeBedToDisplay / 10)} • Bed #{activeBedToDisplay}
              </Text>
            </View>
            <View
              style={[
                styles.dueBadge,
                { backgroundColor: colors.dangerLight, borderColor: colors.danger },
              ]}
            >
              <Text style={[styles.dueBadgeText, { color: colors.danger }]}>PENDING DISCHARGE</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryBox, { backgroundColor: colors.bgDark }]}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Room Charges</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                ₹{bill.roomCharges.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: colors.bgDark }]}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Pharmacy Meds</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                ₹{bill.medicineCharges.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: colors.bgDark }]}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>MediBot Dispatch</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                ₹{bill.robotLogisticsFee.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Grand Total (Incl. GST):</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{bill.total.toFixed(2)}</Text>
          </View>

          {/* Action button to preview printable discharge invoice */}
          <TouchableOpacity
            style={[styles.invoicePreviewBtn, { backgroundColor: colors.primary }]}
            onPress={() => setInvoicePreviewVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={20} color={colors.textInverted} />
            <Text style={[styles.invoicePreviewText, { color: colors.textInverted }]}>
              Generate Official Discharge Invoice Preview
            </Text>
          </TouchableOpacity>
        </View>

        {/* Itemized Charge Line Items */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Itemized Ledger & Mission Dispatches</Text>

          {bill.lineItems.map((item, idx) => (
            <View key={idx} style={[styles.ledgerRow, { borderBottomColor: colors.border }]}>
              <View style={styles.ledgerLeft}>
                <Text style={[styles.itemDesc, { color: colors.textPrimary }]}>{item.description}</Text>
                <Text style={[styles.itemQtyPrice, { color: colors.textSecondary }]}>
                  Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>₹{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Official Discharge Invoice & Settlement Modal */}
      <Modal visible={invoicePreviewVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.invoiceCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={[styles.hospTitle, { color: colors.primary }]}>CHARUSAT HEALTHCARE SYSTEM</Text>
                <Text style={[styles.hospSub, { color: colors.textSecondary }]}>
                  Autonomous Intra-Hospital Logistics & EMR Division
                </Text>
              </View>
              <TouchableOpacity onPress={() => setInvoicePreviewVisible(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.invoiceMetaRow}>
              <Text style={[styles.invoiceMetaText, { color: colors.textSecondary }]}>
                Invoice #: INV-2026-{bill.bedNumber}04
              </Text>
              <Text style={[styles.invoiceMetaText, { color: colors.textSecondary }]}>
                Date: {new Date().toLocaleDateString()}
              </Text>
            </View>

            <Text style={[styles.invoicePatient, { color: colors.textPrimary }]}>
              Patient: {bill.patientName} (Bed {bill.bedNumber})
            </Text>

            <ScrollView style={styles.invoiceScroll}>
              {bill.lineItems.map((item, i) => (
                <View key={i} style={[styles.invoiceItemRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.invoiceItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.invoiceItemPrice, { color: colors.textPrimary }]}>
                    ₹{item.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.invoiceTotalBox, { backgroundColor: colors.bgDark }]}>
              <Text style={[styles.invoiceTotalLabel, { color: colors.textSecondary }]}>
                Grand Total (Incl. Taxes & MediBot Trips):
              </Text>
              <Text style={[styles.invoiceTotalVal, { color: colors.primary }]}>₹{bill.total.toFixed(2)}</Text>
            </View>

            {/* ROLE-GATED DISCHARGE ACTIONS */}
            {isAdmin ? (
              <TouchableOpacity
                style={[styles.settleBtn, { backgroundColor: colors.success }]}
                onPress={handleAdminSettle}
              >
                <Feather name="check-circle" size={16} color={colors.textInverted} />
                <Text style={[styles.settleBtnText, { color: colors.textInverted }]}>
                  Authorize & Finalize Patient Discharge (Admin Only)
                </Text>
              </TouchableOpacity>
            ) : isDoctor ? (
              <TouchableOpacity
                style={[styles.settleBtn, { backgroundColor: colors.danger }]}
                onPress={() => {
                  setInvoicePreviewVisible(false);
                  setDoctorRequestModalVisible(true);
                }}
              >
                <MaterialCommunityIcons name="doctor" size={18} color={colors.textInverted} />
                <Text style={[styles.settleBtnText, { color: colors.textInverted }]}>
                  {pendingRequest ? 'Update Clinical Discharge Request' : 'Submit Clinical Discharge Request'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.roleRestrictionBox, { backgroundColor: colors.bgDark }]}>
                <MaterialCommunityIcons name="shield-lock" size={18} color={colors.warning} />
                <Text style={[styles.roleRestrictionText, { color: colors.textMuted }]}>
                  Discharge clearance is strictly restricted to Facility Administration. Attending physicians can only submit clinical discharge requests.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* DOCTOR CLINICAL DISCHARGE REQUEST MODAL */}
      <Modal visible={doctorRequestModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="stethoscope" size={22} color={colors.danger} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Physician Discharge Recommendation
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDoctorRequestModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Bed #{activeBedToDisplay} • {bill.patientName}
            </Text>

            <View style={[styles.docNoticeBox, { backgroundColor: colors.infoLight, borderColor: colors.primary }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.docNoticeText, { color: colors.textPrimary }]}>
                Hospital Protocol: As attending physician, you submit clinical clearance and medical stability notes. Final discharge authorization and billing settlement is executed by Hospital Administration.
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Clinical Discharge Summary & Vitals Clearance:
            </Text>
            <TextInput
              style={[
                styles.clinicalInput,
                {
                  backgroundColor: colors.bgDark,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              multiline
              numberOfLines={4}
              value={clinicalNotes}
              onChangeText={setClinicalNotes}
              placeholder="Enter patient status, vital sign clearance, and post-discharge prescription..."
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setDoctorRequestModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitRequestBtn, { backgroundColor: colors.danger }]}
                onPress={handleDoctorSubmitRequest}
              >
                <MaterialCommunityIcons name="send" size={16} color={colors.textInverted} />
                <Text style={[styles.submitRequestBtnText, { color: colors.textInverted }]}>
                  Submit Request to Admin
                </Text>
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 110,
  },
  bedPickerCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  bedPickerTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  floorButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  floorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bedScroll: {
    flexDirection: 'row',
  },
  bedChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginRight: 6,
  },
  bedChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  patientBedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  patientBedNoticeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dischargeStatusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBannerText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBannerNotes: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  patientName: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  patientSub: {
    fontSize: 11,
    marginTop: 2,
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryBox: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  invoicePreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  invoicePreviewText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  ledgerLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemDesc: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemQtyPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  invoiceCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  hospTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  hospSub: {
    fontSize: 10,
    marginTop: 1,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  invoiceMetaText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  invoicePatient: {
    fontSize: 13,
    fontWeight: '700',
    marginVertical: Spacing.xs,
  },
  invoiceScroll: {
    maxHeight: 220,
    marginVertical: Spacing.sm,
  },
  invoiceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  invoiceItemName: {
    fontSize: 11,
    flex: 1,
    paddingRight: 6,
  },
  invoiceItemPrice: {
    fontSize: 11,
    fontWeight: '600',
  },
  invoiceTotalBox: {
    padding: Spacing.md,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  invoiceTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  invoiceTotalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  settleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleRestrictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  roleRestrictionText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  modalCard: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  docNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  docNoticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  clinicalInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    fontSize: 12,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: Spacing.md,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  submitRequestBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
