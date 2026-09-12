import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { useRole } from '../../hooks/useRole';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackMessage?: string;
  navigation?: any;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackMessage,
  navigation,
}) => {
  const { role, currentUser } = useRole();

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.restrictedContainer}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="shield-lock-outline" size={48} color={Colors.danger} />
      </View>

      <Text style={styles.errorTitle}>Access Restricted (HTTP 403)</Text>
      <Text style={styles.errorSubtitle}>
        {fallbackMessage || 'You do not hold the required institutional credentials to view this module.'}
      </Text>

      <View style={styles.matrixBox}>
        <View style={styles.matrixRow}>
          <Text style={styles.matrixLabel}>Your Active Persona:</Text>
          <Text style={[styles.matrixVal, { color: Colors.danger }]}>
            {currentUser.name} ({role})
          </Text>
        </View>
        <View style={styles.matrixRow}>
          <Text style={styles.matrixLabel}>Authorized Roles:</Text>
          <Text style={[styles.matrixVal, { color: Colors.primary }]}>
            {allowedRoles.join(' • ')}
          </Text>
        </View>
      </View>

      {navigation && (
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={16} color={Colors.textInverted} />
          <Text style={styles.returnBtnText}>Return to Authorized View</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  restrictedContainer: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.dangerLight,
    borderWidth: 2,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...Typography.bodyRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 300,
    lineHeight: 18,
  },
  matrixBox: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  matrixLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  matrixVal: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    width: '100%',
  },
  returnBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverted,
  },
});
