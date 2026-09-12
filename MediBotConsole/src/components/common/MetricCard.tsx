import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../theme/tokens';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '../../hooks/useTheme';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  badgeLabel?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  badgeLabel,
  badgeVariant = 'info',
  icon,
  subtitle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.iconTitleGroup}>
          {icon && (
            <View style={[styles.iconBox, { backgroundColor: colors.infoLight }]}>
              {icon}
            </View>
          )}
          <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
        </View>
        {badgeLabel && <StatusBadge label={badgeLabel} variant={badgeVariant} size="sm" />}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
      </View>

      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  iconTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  unit: {
    ...Typography.bodyRegular,
    color: Colors.textSecondary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
