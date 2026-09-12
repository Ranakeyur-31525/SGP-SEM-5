import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { StatusBadge } from '../common/StatusBadge';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useBillingStore } from '../../stores/useBillingStore';
import { usePharmacyOrderStore } from '../../stores/usePharmacyOrderStore';

interface PatientBedDashboardProps {
  navigation: any;
}

export const PatientBedDashboard: React.FC<PatientBedDashboardProps> = ({ navigation }) => {
  const { currentUser } = useAuthStore();
  const { getActiveDelivery } = useDeliveryStore();
  const { triggerAlert, getActiveAlertsForBed } = useCallingMatrixStore();
  const { getBillForBed } = useBillingStore();
  const { orders, placeOrder, getOrdersForBed } = usePharmacyOrderStore();

  const bedNumber = currentUser.assignedBed || 12;
  const floorNumber = currentUser.allocatedFloor || Math.ceil(bedNumber / 10);
  const activeDelivery = getActiveDelivery();
  const bedAlerts = getActiveAlertsForBed(bedNumber);
  const myBill = getBillForBed(bedNumber);
  const myOrders = getOrdersForBed(bedNumber);

  // Pharmacy Order Intake Form State (Parity with PatientDashboard.jsx from MEDIBOT)
  const [items, setItems] = useState<string[]>(['Paracetamol 650mg', 'Normal Saline 500mL']);
  const [tagInput, setTagInput] = useState<string>('');
  const [imgUrl, setImgUrl] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<string>('');
  const [orderError, setOrderError] = useState<string>('');

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !items.includes(val)) {
      setItems([...items, val]);
      setTagInput('');
      setOrderError('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setItems(items.filter((item) => item !== tag));
  };

  const handleAttachSampleRx = () => {
    setImgUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop');
    setOrderError('');
  };

  const handleOrderSubmit = () => {
    setOrderError('');
    setOrderSuccess('');

    if (items.length === 0 && !imgUrl) {
      setOrderError('Please list at least one medicine item or attach a prescription.');
      return;
    }

    placeOrder({
      patient_id: currentUser.id,
      patient_name: currentUser.name,
      patient_floor: floorNumber,
      patient_bed: bedNumber,
      ordered_by_role: 'user',
      order_type: imgUrl ? 'prescription_upload' : 'text_input',
      prescription_image_url: imgUrl || null,
      items_list: items,
    });

    setOrderSuccess('Order request submitted! Forwarded to Central Dispensary Chemist queue.');
    setItems([]);
    setImgUrl('');
    setTagInput('');

    setTimeout(() => {
      setOrderSuccess('');
    }, 6000);
  };

  const handleTriggerEmergency = (type: 'DOCTOR' | 'NURSE' | 'PEON', msg: string) => {
    triggerAlert({
      bedNumber,
      floor: floorNumber,
      recipient: type,
      severity: type === 'DOCTOR' ? 'CODE_RED' : type === 'NURSE' ? 'ASSISTANCE' : 'SERVICE',
      patientName: currentUser.name,
      reason: msg,
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. Welcome & Room Location Banner (Matching PatientDashboard.jsx in MEDIBOT) */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeGreeting}>Welcome, {currentUser.name}!</Text>
          <Text style={styles.welcomeRoomSub}>
            ROOM LOCATION: FLOOR {floorNumber} • BED {bedNumber}
          </Text>
          <Text style={styles.admittedDoc}>
            Attending Physician: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Dr. Anita Mehta, MD</Text>
          </Text>
        </View>
        <View style={styles.welcomeIconCircle}>
          <Text style={{ fontSize: 32 }}>🏥</Text>
        </View>
      </View>

      {/* 2. Intercom Emergency Signaling (Pulsating ⚠️ NEED HELP from MEDIBOT) */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyTitleRow}>
          <MaterialCommunityIcons name="alarm-light" size={20} color={Colors.danger} />
          <Text style={styles.emergencyTitle}>Intercom Emergency Signaling</Text>
        </View>
        <Text style={styles.emergencySubtitle}>
          Click below to broadcast an instant emergency alert to all shift nurses and doctors on duty.
        </Text>

        {/* Big Prominent NEED HELP Button */}
        <TouchableOpacity
          style={styles.bigNeedHelpBtn}
          onPress={() =>
            handleTriggerEmergency(
              'NURSE',
              'EMERGENCY HELP REQUEST: Patient in Floor ' + floorNumber + ' / Bed ' + bedNumber + ' needs immediate assistance!'
            )
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="alert-decagram" size={26} color="#FFFFFF" />
          <Text style={styles.bigNeedHelpBtnText}>⚠️ NEED HELP</Text>
        </TouchableOpacity>

        {/* 3 Quick Target Buttons: Doctor / Nurse / Peon */}
        <View style={styles.callButtonsRow}>
          <TouchableOpacity
            style={[styles.callBtn, styles.callBtnRed]}
            onPress={() => handleTriggerEmergency('DOCTOR', 'Bedside CODE RED: Critical distress reported by patient')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="alarm-light" size={18} color={Colors.danger} />
            <Text style={styles.callBtnRedText}>Doctor Code Red</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, styles.callBtnYellow]}
            onPress={() => handleTriggerEmergency('NURSE', 'Patient requesting nursing assistance at Bed ' + bedNumber)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="doctor" size={18} color={Colors.warning} />
            <Text style={styles.callBtnYellowText}>Nurse Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, styles.callBtnBlue]}
            onPress={() => handleTriggerEmergency('PEON', 'Clean drinking water & linen assistance requested')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="water-pump" size={18} color={Colors.info} />
            <Text style={styles.callBtnBlueText}>Water / Orderly</Text>
          </TouchableOpacity>
        </View>

        {bedAlerts.length > 0 && (
          <View style={styles.activeAlertNotice}>
            <Feather name="bell" size={13} color={Colors.danger} />
            <Text style={styles.activeAlertText}>
              Distress Broadcast Active ({bedAlerts.length} Pending Staff Response)
            </Text>
          </View>
        )}
      </View>

      {/* 3. Request Pharmacy & Medical Shop Order (Exact parity with MEDIBOT) */}
      <View style={styles.orderIntakeCard}>
        <View style={styles.orderIntakeHeader}>
          <MaterialCommunityIcons name="pill" size={20} color={Colors.primary} />
          <Text style={styles.orderIntakeTitle}>Request Pharmacy & Medical Shop Order</Text>
        </View>
        <Text style={styles.orderIntakeSub}>
          Add medicines or prescription photo. Chemist will price and dispatch via MediBot.
        </Text>

        {/* Items tag container */}
        <Text style={styles.inputLabel}>Medicine Items List</Text>
        <View style={styles.tagCloudBox}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.tagRemoveBtn}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagTextInput}
              placeholder="Type medicine and tap Add..."
              placeholderTextColor={Colors.textMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
              <Feather name="plus" size={14} color={Colors.textInverted} />
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prescription Attachment */}
        <Text style={[styles.inputLabel, { marginTop: Spacing.sm }]}>Prescription Attachment (Camera / URL)</Text>
        <View style={styles.rxAttachRow}>
          <TextInput
            style={styles.rxInput}
            placeholder="Image URL or captured data..."
            placeholderTextColor={Colors.textMuted}
            value={imgUrl}
            onChangeText={setImgUrl}
          />
          <TouchableOpacity style={styles.attachRxBtn} onPress={handleAttachSampleRx}>
            <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.attachRxBtnText}>📷 Photo</Text>
          </TouchableOpacity>
        </View>

        {imgUrl ? (
          <View style={styles.imgPreviewContainer}>
            <Image source={{ uri: imgUrl }} style={styles.imgPreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImgUrl('')}>
              <Text style={styles.removeImgBtnText}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {orderError ? <Text style={styles.errorText}>{orderError}</Text> : null}
        {orderSuccess ? <Text style={styles.successText}>{orderSuccess}</Text> : null}

        <TouchableOpacity style={styles.submitOrderBtn} onPress={handleOrderSubmit} activeOpacity={0.8}>
          <Feather name="send" size={16} color={Colors.textInverted} />
          <Text style={styles.submitOrderBtnText}>Submit Order to Dispensary</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Active Placed Orders for Bed {bedNumber} */}
      <View style={styles.placedOrdersCard}>
        <View style={styles.placedOrdersHeader}>
          <Text style={styles.placedOrdersTitle}>Your Bed Pharmacy Orders ({myOrders.length})</Text>
        </View>

        {myOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>No pharmacy requests submitted yet.</Text>
        ) : (
          myOrders.map((o) => (
            <View key={o.order_id} style={styles.orderRowCard}>
              <View style={styles.orderRowTop}>
                <Text style={styles.orderIdText}>{o.order_id}</Text>
                <StatusBadge
                  label={o.order_status.toUpperCase()}
                  variant={o.order_status === 'completed' ? 'success' : 'warning'}
                  size="sm"
                />
              </View>
              <Text style={styles.orderItemsSummary}>
                {o.items_list.length > 0 ? o.items_list.join(', ') : 'Prescription Photo Attached'}
              </Text>
              <View style={styles.orderRowBottom}>
                <Text style={styles.orderSubtotal}>
                  {o.subtotal > 0 ? `Subtotal: ₹${o.subtotal.toFixed(2)}` : 'Awaiting Chemist Pricing'}
                </Text>
                <Text style={styles.orderTime}>{o.createdAt}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 5. Live Robot Delivery Arrival Card */}
      {activeDelivery && (
        <View style={styles.deliveryCard}>
          <View style={styles.delHeader}>
            <View style={styles.delBadge}>
              <MaterialCommunityIcons name="robot" size={16} color={Colors.primary} />
              <Text style={styles.delOrderText}>{activeDelivery.orderNumber}</Text>
            </View>
            <Text style={styles.delEtaText}>ETA: ~{activeDelivery.estimatedTransitSeconds}s</Text>
          </View>

          <Text style={styles.delMedTitle}>Medicine Delivery Incoming to Bed {bedNumber}</Text>
          <Text style={styles.delStageDesc}>
            Current Stage: <Text style={{ color: Colors.primary, fontWeight: '700' }}>{activeDelivery.status.replace(/_/g, ' ')}</Text>
          </Text>

          <View style={styles.passcodeBox}>
            <Text style={styles.passcodeLabel}>SG90 Hatch Servo Unlock PIN:</Text>
            <Text style={styles.passcodeVal}>{activeDelivery.passcode}</Text>
          </View>

          <TouchableOpacity
            style={styles.trackNavBtn}
            onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: activeDelivery.id })}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={15} color={Colors.textInverted} />
            <Text style={styles.trackNavText}>View Live Robot Radar & Unlock</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. Bedside Invoice Summary */}
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => navigation.navigate('Billing', { bedNumber })}
        activeOpacity={0.8}
      >
        <View style={styles.invoiceLeft}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.success} />
          <View>
            <Text style={styles.invoiceTitle}>Bed {bedNumber} Inpatient Invoice</Text>
            <Text style={styles.invoiceSub}>Room per diem + Chemist dispensed medications</Text>
          </View>
        </View>
        <View style={styles.invoiceRight}>
          <Text style={styles.invoiceTotal}>₹{myBill.total.toFixed(2)}</Text>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </View>
      </TouchableOpacity>

      {/* 7. Ward Intercom Guideline (Matching MEDIBOT) */}
      <View style={styles.guidelineCard}>
        <Text style={styles.guidelineTitle}>Ward Intercom Guideline</Text>
        <Text style={styles.guidelineText}>
          Your bed and floor locations are automatically attached when you trigger emergency alerts or request medicine orders.
          This ensures immediate response times from attending doctors and nursing staff.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  bedInfoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bedBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bedNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bedNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  patientTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  wardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  doctorInChargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgDark,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  docLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  docName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emergencyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.danger,
    textTransform: 'uppercase',
  },
  emergencySubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  callButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  callBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  callBtnRed: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  callBtnYellow: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
  },
  callBtnBlue: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
  },
  callBtnRedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.danger,
    marginTop: 4,
    textAlign: 'center',
  },
  callBtnYellowText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.warning,
    marginTop: 4,
    textAlign: 'center',
  },
  callBtnBlueText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.info,
    marginTop: 4,
    textAlign: 'center',
  },
  activeAlertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerLight,
    padding: Spacing.xs + 2,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
  activeAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  deliveryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  delHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  delBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  delOrderText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  delEtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  delMedTitle: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  delStageDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  trackNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  trackNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textInverted,
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  invoiceSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
    fontFamily: 'monospace',
  },
  welcomeCard: {
    backgroundColor: '#D97706', // amber-600 gradient tone from MEDIBOT
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeRoomSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FEF3C7',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  admittedDoc: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 4,
  },
  welcomeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigNeedHelpBtn: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: Spacing.sm,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bigNeedHelpBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  orderIntakeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderIntakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  orderIntakeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderIntakeSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  tagCloudBox: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md,
    padding: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    margin: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  tagRemoveBtn: {
    fontSize: 14,
    fontWeight: '900',
    color: '#C7D2FE',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tagTextInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 12,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  addTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  addTagBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textInverted,
  },
  rxAttachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxInput: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 12,
  },
  attachRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  attachRxBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  imgPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    backgroundColor: Colors.bgDark,
    padding: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  imgPreview: {
    width: 60,
    height: 40,
    borderRadius: Radius.sm,
  },
  removeImgBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  removeImgBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  successText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 4,
  },
  submitOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1', // Indigo theme from MEDIBOT
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitOrderBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placedOrdersCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placedOrdersHeader: {
    marginBottom: Spacing.xs,
  },
  placedOrdersTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  noOrdersText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginVertical: 4,
  },
  orderRowCard: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  orderItemsSummary: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
  orderRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  orderTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  passcodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgDark,
    padding: Spacing.xs + 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passcodeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  passcodeVal: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: Colors.warning,
    letterSpacing: 2,
  },
  guidelineCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guidelineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
