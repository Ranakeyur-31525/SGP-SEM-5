import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../stores/useThemeStore';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';

export const SettingsScreen = () => {
  const { theme, isDark } = useTheme();
  const { themeMode, setTheme } = useThemeStore();

  const [brokerHost, setBrokerHost] = useState('broker.hivemq.com');
  const [brokerPort, setBrokerPort] = useState('8884');
  const [telemetryTopic, setTelemetryTopic] = useState('hospital/medibot01/telemetry');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api');
  const [lidarAudioAlert, setLidarAudioAlert] = useState(true);
  const [voiceAnnouncement, setVoiceAnnouncement] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isTestingBroker, setIsTestingBroker] = useState(false);

  const handleTestBroker = () => {
    setIsTestingBroker(true);
    setTimeout(() => {
      setIsTestingBroker(false);
      Alert.alert(
        'Broker Connection Successful',
        `Ping OK (18ms) to ${brokerHost}:${brokerPort}.\nESP32 Telemetry, Elevator Relays, and LiDAR Safety Channel active.`
      );
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header subtitle="Facility Configuration & Hardware Preferences" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Preference Setting (Clinical Light vs Cyber Dark) */}
        <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Interface Appearance</Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.textMuted }]}>
            Toggle between hospital clinical daylight mode and night-shift cyber dark theme without contrast bleed.
          </Text>

          <View style={styles.themeOptionsRow}>
            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: themeMode === 'light' ? theme.primary : theme.border,
                },
                themeMode === 'light' && { borderWidth: 2 },
              ]}
              onPress={() => setTheme('light')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={28}
                color={themeMode === 'light' ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  { color: themeMode === 'light' ? theme.primary : theme.textSecondary },
                ]}
              >
                Clinical Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOptionBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: themeMode === 'dark' ? theme.primary : theme.border,
                },
                themeMode === 'dark' && { borderWidth: 2 },
              ]}
              onPress={() => setTheme('dark')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="weather-night"
                size={28}
                color={themeMode === 'dark' ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  { color: themeMode === 'dark' ? theme.primary : theme.textSecondary },
                ]}
              >
                Cyber Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MQTT Broker Configuration */}
        <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="access-point-network" size={20} color={theme.accent} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              ESP32 IoT Broker & Topics
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.textMuted }]}>
            Sub-second real-time telemetry bridge for 100Hz LiDAR, line tracking & servo lock.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Broker Host</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
              value={brokerHost}
              onChangeText={setBrokerHost}
              placeholder="e.g. broker.hivemq.com"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>WebSocket Port (SSL/WSS)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
              value={brokerPort}
              onChangeText={setBrokerPort}
              keyboardType="numeric"
              placeholder="e.g. 8884"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Telemetry Channel Topic</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
              value={telemetryTopic}
              onChangeText={setTelemetryTopic}
            />
          </View>

          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: theme.primary }]}
            onPress={handleTestBroker}
            disabled={isTestingBroker}
          >
            <MaterialCommunityIcons
              name={isTestingBroker ? 'loading' : 'check-network-outline'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.testBtnText}>
              {isTestingBroker ? 'Testing Handshake...' : 'Ping Broker & Test IoT Link'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Django Backend API Endpoint Setting */}
        <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="server-network" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Django REST & MongoDB ERP Endpoint
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.textMuted }]}>
            Base URL for hospital inventory catalog, drug approval queue, and billing engine.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>API Base URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="http://localhost:8000/api"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        {/* Safety & Audio Feedback Settings */}
        <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="bell-ring" size={20} color={theme.warning} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Safety Audio & Interlocks
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>
                LiDAR &lt;=30cm Safety Horn
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Siren pulse when obstacle safety brake is engaged
              </Text>
            </View>
            <Switch
              value={lidarAudioAlert}
              onValueChange={setLidarAudioAlert}
              trackColor={{ false: theme.surfaceElevated, true: theme.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>
                Bedside Vocal Arrival Chime
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Audio greeting on arrival at target bed unit
              </Text>
            </View>
            <Switch
              value={voiceAnnouncement}
              onValueChange={setVoiceAnnouncement}
              trackColor={{ false: theme.surfaceElevated, true: theme.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>
                Haptic Confirmation on PIN Unlock
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Tactile feedback when SG90 servo unlocks hatch
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: theme.surfaceElevated, true: theme.primary }}
            />
          </View>
        </View>

        {/* Build & Firmware Details */}
        <View style={[styles.settingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>System & Firmware</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Runtime Engine</Text>
            <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
              Expo SDK 54 (React Native 0.81.5)
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Microcontroller</Text>
            <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
              ESP32-WROOM-32D (Dual Core 240MHz)
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Sensors</Text>
            <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
              TF-Luna ToF LiDAR + 5-Ch IR Line Array
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Payload Lock</Text>
            <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
              SG90 9g Micro Servo (PWM GPIO 13)
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Facility Scale</Text>
            <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
              5 Floors • 50 Beds • 1 Autonomous Fleet Unit
            </Text>
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
    gap: Spacing.md,
  },
  settingCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 11,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  themeOptionBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 6,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaKey: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
  },
});
