import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';

export const UserManagementScreen = () => {
  const { userAccounts, addUserAccount, toggleUserStatus, updateUserBed } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('NURSE');
  const [department, setDepartment] = useState('General Ward');
  const [assignedBed, setAssignedBed] = useState('15');

  const handleCreateUser = () => {
    if (!name || !email) return;

    addUserAccount({
      name,
      email,
      role,
      department,
      assignedBed: role === 'PATIENT' ? parseInt(assignedBed, 10) || 1 : undefined,
      isActive: true,
    });

    setName('');
    setEmail('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header subtitle="Institutional RBAC & Staff Account Provisioning" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Row with Provisioning Trigger */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.sectionTitle}>Hospital Directory ({userAccounts.length})</Text>
            <Text style={styles.sectionSubtitle}>Active staff & patient permissions</Text>
          </View>
          <TouchableOpacity
            style={styles.addUserBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={15} color={Colors.textInverted} />
            <Text style={styles.addUserBtnText}>Provision Account</Text>
          </TouchableOpacity>
        </View>

        {/* User Accounts List */}
        {userAccounts.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userCardTop}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>

              <StatusBadge
                label={user.role}
                variant={
                  user.role === 'DOCTOR'
                    ? 'danger'
                    : user.role === 'NURSE'
                    ? 'secondary'
                    : user.role === 'CHEMIST'
                    ? 'primary'
                    : user.role === 'ADMIN'
                    ? 'warning'
                    : 'success'
                }
                size="sm"
              />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaDepartment}>
                Dept: {user.department || 'Clinical Care'}
              </Text>
              {user.assignedBed && (
                <Text style={styles.metaBed}>Assigned: Bed {user.assignedBed}</Text>
              )}
            </View>

            {/* Admin Controls */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { borderColor: user.isActive ? Colors.danger : Colors.success },
                ]}
                onPress={() => toggleUserStatus(user.id)}
              >
                <Feather
                  name={user.isActive ? 'user-x' : 'user-check'}
                  size={13}
                  color={user.isActive ? Colors.danger : Colors.success}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: user.isActive ? Colors.danger : Colors.success },
                  ]}
                >
                  {user.isActive ? 'Deactivate Access' : 'Activate User'}
                </Text>
              </TouchableOpacity>

              {user.role === 'PATIENT' && (
                <TouchableOpacity
                  style={styles.reassignBedBtn}
                  onPress={() => {
                    const newBed = ((user.assignedBed || 1) % 50) + 1;
                    updateUserBed(user.id, newBed);
                  }}
                >
                  <Feather name="refresh-cw" size={12} color={Colors.primary} />
                  <Text style={styles.reassignBedText}>Cycle Bed Location</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Provision Account Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Provision New Staff / Patient</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Dr. Rajesh Patel"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="rajesh@medibot.hospital"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role Designation</Text>
              <View style={styles.roleGrid}>
                {(['PATIENT', 'DOCTOR', 'NURSE', 'CHEMIST', 'ADMIN'] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {role === 'PATIENT' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assigned Bed Number (1 - 50)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={assignedBed}
                  onChangeText={setAssignedBed}
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department / Ward</Text>
                <TextInput
                  style={styles.textInput}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            )}

            <TouchableOpacity style={styles.createBtn} onPress={handleCreateUser}>
              <Text style={styles.createBtnText}>Save & Authorize Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  addUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  addUserBtnText: {
    color: Colors.textInverted,
    fontSize: 12,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  userCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.titleSmall,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xs + 2,
  },
  metaDepartment: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  metaBed: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.bgSurfaceLight,
    paddingTop: 6,
    marginTop: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reassignBedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  reassignBedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: Colors.textInverted,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  createBtnText: {
    color: Colors.textInverted,
    fontSize: 13,
    fontWeight: '800',
  },
});
