import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, PRESET_PERSONAS } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { UserRole } from '../../types';

interface PersonaSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentUser, loginAsPersona } = useAuthStore();
  const { colors } = useTheme();

  const handleSelectRole = (role: UserRole) => {
    loginAsPersona(role);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Switch Clinical Persona
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
            Demonstrate role-gated UI and bed-isolation permissions across staff and patients:
          </Text>

          {PRESET_PERSONAS.map((p) => {
            const isSelected = currentUser.role === p.role;
            return (
              <TouchableOpacity
                key={p.role}
                style={[
                  styles.personaOption,
                  {
                    backgroundColor: colors.bgDark,
                    borderColor: isSelected ? colors.primary : colors.bgSurfaceLight,
                  },
                  isSelected && { backgroundColor: colors.bgCardSecondary },
                ]}
                onPress={() => handleSelectRole(p.role)}
                activeOpacity={0.7}
              >
                <View style={styles.personaOptionInfo}>
                  <Text style={[styles.personaOptionLabel, { color: colors.textPrimary }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.personaOptionDetail, { color: colors.textSecondary }]}>
                    {p.profile.name} • {p.profile.department}
                  </Text>
                </View>
                {isSelected && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  personaOptionInfo: {
    flex: 1,
  },
  personaOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  personaOptionDetail: {
    fontSize: 11,
  },
});
