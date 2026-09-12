import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius, Spacing } from '../../theme/tokens';
import { useTheme } from '../../hooks/useTheme';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'info',
  size = 'md',
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success, border: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, border: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger, border: colors.danger };
      case 'primary':
        return { bg: colors.infoLight, text: colors.primary, border: colors.primary };
      case 'secondary':
        return { bg: colors.secondary + '22', text: colors.secondary, border: colors.secondary };
      case 'info':
      default:
        return { bg: colors.infoLight, text: colors.info, border: colors.info };
    }
  };

  const theme = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          paddingHorizontal: isSm ? Spacing.sm : Spacing.md,
          paddingVertical: isSm ? 2 : Spacing.xs,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.text,
            fontSize: isSm ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
