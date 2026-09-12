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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/useAuthStore';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';

interface BedInfo {
  bedNumber: number;
  floor: number;
  wardName: string;
  patientName?: string;
  condition?: string;
  isOccupied: boolean;
  hasActiveDelivery?: boolean;
}

// 50-Bed Facility Data
const HOSPITAL_BEDS: BedInfo[] = Array.from({ length: 50 }, (_, i) => {
  const bedNum = i + 1;
  const floor = Math.ceil(bedNum / 10);
  const isBed12 = bedNum === 12;

  let wardName = 'General Medical';
  if (floor === 1) wardName = 'Emergency & Trauma';
  else if (floor === 2) wardName = 'Cardiology & CCU';
  else if (floor === 3) wardName = 'Intensive Care Unit';
  else if (floor === 4) wardName = 'Surgical & Post-Op';
  else if (floor === 5) wardName = 'Neurology & Oncology';

  if (isBed12) {
    return {
      bedNumber: 12,
      floor: 2,
      wardName: 'Cardiology Ward Floor 2',
      patientName: 'Ramesh Sharma',
      condition: 'Acute Coronary Syndrome (Post-Angioplasty)',
      isOccupied: true,
      hasActiveDelivery: true,
    };
  }

  // Pre-populate some realistic patients
  const sampleOccupied = [1, 3, 5, 8, 14, 18, 22, 24, 29, 31, 35, 38, 41, 45, 48];
  const isOccupied = sampleOccupied.includes(bedNum);

  return {
    bedNumber: bedNum,
    floor,
    wardName,
    patientName: isOccupied ? `Patient #${bedNum}` : undefined,
    condition: isOccupied ? 'Admitted Care' : undefined,
    isOccupied,
    hasActiveDelivery: bedNum === 38,
  };
});

export const DestinationSelectScreen = () => {
  const { colors } = useTheme();
  const { currentUser } = useAuthStore();
  const { isPatient } = useRole();
  const navigation = useNavigation<any>();

  const [activeFloor, setActiveFloor] = useState<number>(isPatient ? 2 : 1);
  const [selectedBed, setSelectedBed] = useState<number>(isPatient ? 12 : 1);

  const floorBeds = HOSPITAL_BEDS.filter((b) => b.floor === activeFloor);

  const handleSelectBed = (bed: BedInfo) => {
    if (isPatient && bed.bedNumber !== 12) {
      Alert.alert(
        'Bed Isolation Enforced',
        'Hospital Safety Protocol: Patients are restricted to their assigned bed (Bed 12).'
      );
      return;
    }
    setSelectedBed(bed.bedNumber);
  };

  const handleConfirmDestination = () => {
    Alert.alert(
      'Target Assigned',
      `MediBot navigation destination set to Floor ${activeFloor}, Bed #${selectedBed}.`,
      [
        {
          text: 'Open Delivery Order',
          onPress: () => navigation.navigate('PharmacyOrder'),
        },
        { text: 'OK' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgDark }]}>
      <Header subtitle="Autonomous Target Facility Destination Hub" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Patient Isolation Banner */}
        {isPatient ? (
          <View style={[styles.patientGuardCard, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <MaterialCommunityIcons name="shield-lock-outline" size={24} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.guardTitle, { color: colors.warning }]}>
                PATIENT BED RESTRICTION ACTIVE
              </Text>
              <Text style={[styles.guardBody, { color: colors.textPrimary }]}>
                You are registered to Bed #12 (Cardiology Floor 2). In accordance with institutional patient privacy and safety protocols, target destination routing is locked to your unit.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.staffInfoCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="hospital-building" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffInfoTitle, { color: colors.textPrimary }]}>
                50-Bed Facility Matrix Navigation
              </Text>
              <Text style={[styles.staffInfoSub, { color: colors.textMuted }]}>
                Select target floor and hospital bed node for autonomous payload dispatch.
              </Text>
            </View>
          </View>
        )}

        {/* Floor Selection Tabs */}
        {!isPatient && (
          <View style={styles.floorTabsRow}>
            {[1, 2, 3, 4, 5].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.floorTab,
                  {
                    backgroundColor: activeFloor === f ? colors.primary : colors.bgCard,
                    borderColor: activeFloor === f ? colors.primaryLight : colors.border,
                  },
                ]}
                onPress={() => setActiveFloor(f)}
              >
                <Text
                  style={[
                    styles.floorTabText,
                    { color: activeFloor === f ? colors.textInverted : colors.textSecondary },
                  ]}
                >
                  Floor {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Beds Grid / List */}
        <View style={[styles.sectionHeader, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {isPatient ? 'Assigned Bed Unit' : `Floor ${activeFloor} Wards (Beds ${(activeFloor - 1) * 10 + 1} - ${activeFloor * 10})`}
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Available</Text>
            </View>
          </View>
        </View>

        {/* Render Beds */}
        <View style={styles.bedsGrid}>
          {(isPatient ? HOSPITAL_BEDS.filter((b) => b.bedNumber === 12) : floorBeds).map((bed) => {
            const isSelected = selectedBed === bed.bedNumber;

            return (
              <TouchableOpacity
                key={bed.bedNumber}
                style={[
                  styles.bedCard,
                  {
                    backgroundColor: colors.bgCard,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                  isSelected && { borderWidth: 2 },
                ]}
                onPress={() => handleSelectBed(bed)}
                activeOpacity={0.7}
              >
                <View style={styles.bedTopRow}>
                  <Text style={[styles.bedNumText, { color: colors.textPrimary }]}>
                    Bed #{bed.bedNumber}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: bed.isOccupied ? colors.successLight : colors.bgInput,
                        borderColor: bed.isOccupied ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: bed.isOccupied ? colors.success : colors.textMuted },
                      ]}
                    >
                      {bed.isOccupied ? 'OCCUPIED' : 'VACANT'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.bedWardText, { color: colors.textMuted }]}>{bed.wardName}</Text>

                {bed.patientName && (
                  <View style={styles.patientInfoBox}>
                    <Text style={[styles.patientLabel, { color: colors.textPrimary }]}>
                      {bed.patientName}
                    </Text>
                    {bed.condition && (
                      <Text style={[styles.patientCond, { color: colors.textMuted }]} numberOfLines={1}>
                        {bed.condition}
                      </Text>
                    )}
                  </View>
                )}

                {bed.hasActiveDelivery && (
                  <View style={[styles.activeDeliveryPill, { backgroundColor: colors.infoLight }]}>
                    <MaterialCommunityIcons name="robot" size={12} color={colors.info} />
                    <Text style={[styles.activeDeliveryText, { color: colors.info }]}>
                      Payload En Route
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Target Details Confirmation Card */}
        <View style={[styles.targetSummaryCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Selected Node Destination</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Assigned Bed</Text>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>
                Bed #{selectedBed} (Floor {Math.ceil(selectedBed / 10)})
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirmDestination}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.textInverted} />
              <Text style={styles.confirmBtnText}>Set Destination</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  patientGuardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  guardTitle: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  guardBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  staffInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  staffInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  staffInfoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  floorTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  floorTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  floorTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
  },
  bedsGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bedCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  bedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedNumText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  bedWardText: {
    fontSize: 11,
    marginTop: 2,
  },
  patientInfoBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  patientLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientCond: {
    fontSize: 11,
    marginTop: 1,
  },
  activeDeliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  activeDeliveryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  targetSummaryCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
