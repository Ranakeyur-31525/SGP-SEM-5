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
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useRole } from '../../hooks/useRole';
import { useAuthStore } from '../../stores/useAuthStore';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { PersonaSelectorModal } from '../../components/common/PersonaSelectorModal';

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const { currentUser, logout } = useAuthStore();
  const { isPatient, isDoctor, isNurse, isChemist, isAdmin } = useRole();
  const navigation = useNavigation<any>();

  const [personaModalVisible, setPersonaModalVisible] = useState(false);

  const getRoleColor = () => {
    if (isPatient) return theme.warning;
    if (isDoctor) return theme.emergency;
    if (isNurse) return theme.primary;
    if (isChemist) return theme.accent;
    return theme.primary;
  };

  const getPermissions = () => {
    if (isPatient) {
      return [
        'Admitted Bed #12 Access Only (Floor 2)',
        'Direct Bedside Emergency Call Matrix',
        'Real-time MediBot Delivery Tracker & ETA',
        'Live Patient Invoicing & Turnaround Billing',
      ];
    }
    if (isDoctor) {
      return [
        'STAT Bedside Prescription Delivery Dispatch (Beds 1–50)',
        'Unlisted Drug Proposals to Pharmacy Queue',
        'Critical Care Emergency Calling Reception',
        'Fleet Radar & Telemetry Monitoring',
      ];
    }
    if (isNurse) {
      return [
        '4-Digit PIN SG90 Hatch Deadbolt Unlock',
        'Ward Bed Call Intercom & Acknowledgment',
        'Ward Supply Requisition to Central Pharmacy',
        'Bedside Administration Recording',
      ];
    }
    if (isChemist) {
      return [
        'Central Pharmacy Inventory & Formulary Ledger Control',
        'Exclusive Medicine Stock-In & Quantity Increments',
        'Doctor Drug Proposal Approval / Rejection Queue',
        'Autonomous MediBot Mission Loading & Dispatch',
      ];
    }
    return [
      'Full Institutional ERP Administrator Privileges',
      'ESP32 Multi-Floor Elevator Relay Override',
      'LiDAR 100Hz Black-Box Safety Log Inspection',
      'Staff RBAC Provisioning & Role Management',
      '50-Bed Turnaround Revenue & EMR Audit',
    ];
  };

  const handleLogout = () => {
    Alert.alert('Session Termination', 'Are you sure you want to sign out of MediBot Console?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        },
      },
    ]);
  };

  const roleColor = getRoleColor();
  const permissions = getPermissions();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header subtitle="Institutional Identity & Staff Credential Badge" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
              <MaterialCommunityIcons
                name={
                  isPatient
                    ? 'bed'
                    : isDoctor
                    ? 'doctor'
                    : isNurse
                    ? 'account-heart'
                    : isChemist
                    ? 'pill'
                    : 'shield-crown'
                }
                size={40}
                color={roleColor}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>{currentUser.role}</Text>
              </View>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>{currentUser.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{currentUser.email}</Text>
            </View>
          </View>

          <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />

          <View style={styles.detailGrid}>
            <View style={styles.detailCell}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Credential / ID</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {isPatient ? 'MRN-2026-0812' : `MED-${currentUser.id.toUpperCase()}`}
              </Text>
            </View>

            <View style={styles.detailCell}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Department</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {currentUser.department || 'Healthcare Operations'}
              </Text>
            </View>

            {isPatient ? (
              <>
                <View style={styles.detailCell}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Assigned Bed</Text>
                  <Text style={[styles.detailValue, { color: theme.warning }]}>
                    Bed #12 (Cardiology)
                  </Text>
                </View>

                <View style={styles.detailCell}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Admit Floor</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary }]}>Floor 2</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailCell}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Duty Shift</Text>
                  <Text style={[styles.detailValue, { color: theme.primary }]}>
                    {currentUser.dutyShift || 'Active On-Duty Shift'}
                  </Text>
                </View>

                <View style={styles.detailCell}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Status</Text>
                  <Text style={[styles.detailValue, { color: theme.success }]}>Authenticated Active</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Permissions & Protocol Clearances */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-check" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Institutional Access Grants
            </Text>
          </View>

          <View style={styles.permList}>
            {permissions.map((perm, idx) => (
              <View key={idx} style={styles.permItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color={theme.success} />
                <Text style={[styles.permText, { color: theme.textPrimary }]}>{perm}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Switch Persona Trigger */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
          onPress={() => setPersonaModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account-convert" size={20} color={theme.primary} />
          <Text style={[styles.actionBtnText, { color: theme.primary }]}>
            Switch Persona / Demo Role
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.emergency + '15', borderColor: theme.emergency }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.emergency} />
          <Text style={[styles.actionBtnText, { color: theme.emergency }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Persona Modal */}
      <PersonaSelectorModal
        visible={personaModalVisible}
        onClose={() => setPersonaModalVisible(false)}
      />
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
    gap: Spacing.md,
  },
  profileCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  metaDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailCell: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 10,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  permList: {
    gap: 8,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permText: {
    fontSize: 11,
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
