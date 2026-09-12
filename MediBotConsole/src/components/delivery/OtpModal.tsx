import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius, Spacing, Typography } from '../../theme/tokens';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useTheme } from '../../hooks/useTheme';

interface OtpModalProps {
  visible: boolean;
  deliveryId: string;
  expectedPin: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  visible,
  deliveryId,
  expectedPin,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { verifyAndUnlockHatch } = useDeliveryStore();
  const { hatchState } = useRobotStore();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMessage('');
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const submitPin = (enteredPin: string) => {
    const result = verifyAndUnlockHatch(deliveryId, enteredPin);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setErrorMessage(result.message);
      setPin('');
    }
  };

  const fillTestPasscode = () => {
    setPin(expectedPin);
    submitPin(expectedPin);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.6)' }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 16) + Spacing.md,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <MaterialCommunityIcons
                name={isSuccess ? 'lock-open-variant' : 'lock-alert'}
                size={24}
                color={isSuccess ? colors.success : colors.primary}
              />
              <Text style={[styles.title, { color: colors.textPrimary }]}>SG90 Servo Deadbolt Unlock</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              accessibilityLabel="Close unlock modal"
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            Enter the 4-digit verification passcode assigned to this delivery to actuate the ESP32 SG90 servo hatch.
          </Text>

          {/* Quick Viva Fill Helper */}
          <TouchableOpacity
            style={[
              styles.demoFillBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={fillTestPasscode}
            activeOpacity={0.7}
          >
            <Feather name="key" size={14} color={colors.primary} />
            <Text style={[styles.demoFillText, { color: colors.primary }]}>
              Auto-Fill Assigned PIN: <Text style={{ fontWeight: '900', letterSpacing: 2 }}>{expectedPin}</Text>
            </Text>
          </TouchableOpacity>

          {/* 4-Digit PIN Slot Display */}
          <View style={styles.pinSlotsRow}>
            {[0, 1, 2, 3].map((index) => {
              const char = pin[index] || '';
              const isFilled = char !== '';
              return (
                <View
                  key={index}
                  style={[
                    styles.pinSlot,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                    isFilled && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight,
                    },
                    isSuccess && {
                      borderColor: colors.success,
                      backgroundColor: colors.successLight,
                    },
                    errorMessage !== '' && {
                      borderColor: colors.danger,
                      backgroundColor: colors.dangerLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pinChar,
                      { color: colors.textPrimary },
                      isFilled && { color: colors.primary },
                      isSuccess && { color: colors.success },
                      errorMessage !== '' && { color: colors.danger },
                    ]}
                  >
                    {isFilled ? '●' : ''}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Feedback messages */}
          {errorMessage !== '' && (
            <View style={[styles.feedbackBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
              <Feather name="alert-triangle" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {isSuccess && (
            <View style={[styles.feedbackBox, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.successText, { color: colors.success }]}>
                PASSED! SG90 Servo Hatch Unlocked & EMR Turnaround Billed.
              </Text>
            </View>
          )}

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['C', '0', 'DEL'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((item) => {
                  const isSpecial = item === 'C' || item === 'DEL';
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.keypadBtn,
                        {
                          backgroundColor: isSpecial ? colors.surfaceElevated : colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (item === 'C') handleClear();
                        else if (item === 'DEL') handleDelete();
                        else handleKeyPress(item);
                      }}
                      activeOpacity={0.7}
                    >
                      {item === 'DEL' ? (
                        <Feather name="delete" size={20} color={colors.textSecondary} />
                      ) : (
                        <Text
                          style={[
                            styles.keypadNumText,
                            { color: isSpecial ? colors.textSecondary : colors.textPrimary },
                          ]}
                        >
                          {item}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  title: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    ...Typography.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 4,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  pinSlot: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinChar: {
    fontSize: 22,
    fontWeight: '900',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  keypad: {
    marginTop: Spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  keypadBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keypadNumText: {
    fontSize: 20,
    fontWeight: '800',
  },
});
