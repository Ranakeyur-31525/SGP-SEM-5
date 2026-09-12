import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Radius, Spacing, Typography } from '../theme/tokens';

export const WelcomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.8)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Initial Fade In
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite Medical Pulse Animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Glowing Radar Ring Wave
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScaleAnim, {
            toValue: 1.6,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScaleAnim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    ringLoop.start();

    // Automatic smooth transition after 3.2 seconds
    const timer = setTimeout(() => {
      handleProceed();
    }, 3200);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
      ringLoop.stop();
    };
  }, []);

  const handleProceed = () => {
    if (navigation?.navigate) {
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Animated Medical Cross Centerpiece */}
        <View style={styles.centerStage}>
          {/* Pulsing Outer Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                borderColor: theme.primary,
                backgroundColor: theme.primaryLight,
                transform: [{ scale: ringScaleAnim }],
                opacity: ringOpacityAnim,
              },
            ]}
          />

          {/* Core Pulsing Icon Badge */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
                transform: [{ scale: pulseAnim }],
                shadowColor: theme.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="hospital-box"
              size={56}
              color={theme.primary}
            />
          </Animated.View>
        </View>

        {/* Text Details with Slide & Fade */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.badgePill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.badgePillText, { color: theme.textSecondary }]}>
              HOSPITAL AUTONOMOUS ROBOTICS ERP
            </Text>
          </View>

          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            MEDIBOT <Text style={{ color: theme.primary }}>CONSOLE</Text>
          </Text>

          <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
            Autonomous Intra-Hospital Logistics & High-Reliability Medication Delivery
          </Text>

          {/* Subsystem Specifications */}
          <View style={[styles.specsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="radar" size={16} color={theme.accent} />
              <Text style={[styles.specText, { color: theme.textPrimary }]}>100Hz LiDAR</Text>
            </View>
            <View style={[styles.specDivider, { backgroundColor: theme.border }]} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="lock-check" size={16} color={theme.success} />
              <Text style={[styles.specText, { color: theme.textPrimary }]}>SG90 Servo</Text>
            </View>
            <View style={[styles.specDivider, { backgroundColor: theme.border }]} />
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="office-building" size={16} color={theme.primary} />
              <Text style={[styles.specText, { color: theme.textPrimary }]}>5 Floors / 50 Beds</Text>
            </View>
          </View>
        </Animated.View>

        {/* Enter / Skip CTA */}
        <Animated.View style={[styles.footerArea, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.enterButton, { backgroundColor: theme.primary }]}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={[styles.enterButtonText, { color: '#FFFFFF' }]}>
              Enter Hospital Console
            </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  centerStage: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
  },
  iconWrapper: {
    width: 108,
    height: 108,
    borderRadius: 32,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 340,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xl,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specDivider: {
    width: 1,
    height: 14,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerArea: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  enterButton: {
    width: '100%',
    height: 50,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  enterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
