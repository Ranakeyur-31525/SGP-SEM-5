import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '../../theme/tokens';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MetricCard } from '../../components/common/MetricCard';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRobotStore } from '../../stores/useRobotStore';
import { useDeliveryStore } from '../../stores/useDeliveryStore';
import { useCallingMatrixStore } from '../../stores/useCallingMatrixStore';
import { useTheme } from '../../hooks/useTheme';
import { UserRole } from '../../types';

type AdminTab = 'COMMAND' | 'BEDS_MATRIX' | 'LIFT_IOT' | 'STAFF_RBAC';

export const AdminScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { userAccounts, toggleUserStatus, addUserAccount } = useAuthStore();
  const {
    status: robotStatus,
    lidar,
    power,
    emergencyStop,
    currentFloor,
    currentJunction,
    lift,
    triggerEmergencyStop,
    resetEmergencyStop,
  } = useRobotStore();
  const { deliveries } = useDeliveryStore();
  const { alerts } = useCallingMatrixStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('COMMAND');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<number>(1);

  // Staff provisioning form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('NURSE');
  const [newStaffDept, setNewStaffDept] = useState('');

  // 50 Beds Data Generator
  const allBeds = Array.from({ length: 50 }, (_, i) => {
    const bedNum = i + 1;
    const floor = Math.ceil(bedNum / 10);
    const hasAlert = alerts.some((a) => a.bedNumber === bedNum && !a.isResolved);
    const hasActiveDelivery = deliveries.some((d) => d.targetBed === bedNum && d.status !== 'RETURN_TO_DOCK');
    const isOccupied = bedNum <= 36; // 36/50 beds occupied in mock hospital
    return {
      bedNum,
      floor,
      hasAlert,
      hasActiveDelivery,
      isOccupied,
      patientName: isOccupied ? (bedNum === 12 ? 'Ramesh Sharma' : `Inpatient #${bedNum}`) : 'Vacant',
    };
  });

  const handleAddStaff = () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      Alert.alert('Missing Details', 'Please provide staff name and enterprise email address.');
      return;
    }

    addUserAccount({
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      department: newStaffDept.trim() || 'Hospital Facility',
      isActive: true,
    });

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffDept('');
    Alert.alert('Staff Account Provisioned', `New user ${newStaffName} (${newStaffRole}) credential active.`);
  };

  const activeDeliveries = deliveries.filter((d) => d.status !== 'RETURN_TO_DOCK');
  const pendingAlerts = alerts.filter((a) => !a.isResolved);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header subtitle="Enterprise Hospital Command & Autonomous Fleet Ops" showBack={true} />

      {/* Admin 4-Way Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'COMMAND' && [styles.tabItemActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('COMMAND')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'COMMAND' ? colors.primary : colors.textSecondary }]}>
            Command
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'BEDS_MATRIX' && [styles.tabItemActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('BEDS_MATRIX')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'BEDS_MATRIX' ? colors.primary : colors.textSecondary }]}>
            50 Beds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'LIFT_IOT' && [styles.tabItemActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('LIFT_IOT')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'LIFT_IOT' ? colors.primary : colors.textSecondary }]}>
            Lift IoT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'STAFF_RBAC' && [styles.tabItemActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('STAFF_RBAC')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'STAFF_RBAC' ? colors.primary : colors.textSecondary }]}>
            Staff & RBAC
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: COMMAND & FLEET OVERVIEW */}
        {activeTab === 'COMMAND' && (
          <View style={styles.sectionGap}>
            {/* E-Stop Emergency Override Card */}
            <View
              style={[
                styles.estopCard,
                {
                  backgroundColor: emergencyStop ? colors.dangerLight : colors.surface,
                  borderColor: emergencyStop ? colors.danger : colors.border,
                },
              ]}
            >
              <View style={styles.estopHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.estopTitle, { color: emergencyStop ? colors.danger : colors.textPrimary }]}>
                    {emergencyStop ? '⚠️ AUTONOMOUS E-STOP ACTIVE' : 'Autonomous Fleet Safety Interlock'}
                  </Text>
                  <Text style={[styles.estopSub, { color: colors.textSecondary }]}>
                    {emergencyStop
                      ? 'Motors locked. TF-Luna LiDAR safety override engaged.'
                      : 'Real-time 100Hz TF-Luna LiDAR obstacle monitoring active.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.estopActionBtn,
                    { backgroundColor: emergencyStop ? colors.success : colors.danger },
                  ]}
                  onPress={emergencyStop ? resetEmergencyStop : triggerEmergencyStop}
                >
                  <Text style={styles.estopActionBtnText}>
                    {emergencyStop ? 'RESET E-STOP' : 'HALT ALL BOTS'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Metric Cards Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="LiDAR Safety"
                  value={`${lidar.distanceCm} cm`}
                  unit="Distance"
                  badgeLabel={lidar.brakeEngaged ? 'BRAKE' : 'CLEAR'}
                  badgeVariant={lidar.brakeEngaged ? 'danger' : 'success'}
                  icon={<MaterialCommunityIcons name="radar" size={16} color={colors.primary} />}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Battery 2S Pack"
                  value={`${power.batteryPercentage}%`}
                  unit={`${power.batteryVoltage}V`}
                  badgeLabel={power.batteryPercentage > 30 ? 'NORMAL' : 'LOW'}
                  badgeVariant={power.batteryPercentage > 30 ? 'success' : 'danger'}
                  icon={<MaterialCommunityIcons name="battery-charging" size={16} color={colors.accent} />}
                />
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Active Missions"
                  value={activeDeliveries.length}
                  unit="Deliveries"
                  badgeLabel="FLEET LIVE"
                  badgeVariant="primary"
                  icon={<MaterialCommunityIcons name="robot" size={16} color={colors.primary} />}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Hospital Distress"
                  value={pendingAlerts.length}
                  unit="Calls"
                  badgeLabel={pendingAlerts.length > 0 ? 'ATTENTION' : 'CLEAR'}
                  badgeVariant={pendingAlerts.length > 0 ? 'warning' : 'success'}
                  icon={<MaterialCommunityIcons name="alarm-light" size={16} color={colors.warning} />}
                />
              </View>
            </View>

            {/* Active Missions Feed */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Active Autonomous Missions</Text>
              {activeDeliveries.length === 0 ? (
                <Text style={[styles.emptyNotice, { color: colors.textSecondary }]}>No missions currently en route.</Text>
              ) : (
                activeDeliveries.map((d) => (
                  <View key={d.id} style={[styles.deliveryRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View>
                      <Text style={[styles.dOrderNum, { color: colors.primary }]}>{d.orderNumber}</Text>
                      <Text style={[styles.dTarget, { color: colors.textPrimary }]}>
                        Floor {d.targetFloor} • Bed {d.targetBed}
                      </Text>
                      <Text style={[styles.dPrescribed, { color: colors.textMuted }]}>{d.prescribedBy}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge label={d.status} variant="primary" size="sm" />
                      <Text style={[styles.dPin, { color: colors.textSecondary }]}>PIN: {d.passcode}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* TAB 2: 50 BEDS WARD GRID */}
        {activeTab === 'BEDS_MATRIX' && (
          <View style={styles.sectionGap}>
            <View style={styles.matrixHeaderRow}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>50-Bed Hospital Ward Grid</Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Live occupancy, mission delivery targeting, and bed distress alerts
                </Text>
              </View>
            </View>

            {/* Floor filter */}
            <View style={styles.floorFilterRow}>
              {[1, 2, 3, 4, 5].map((fl) => (
                <TouchableOpacity
                  key={fl}
                  style={[
                    styles.floorPill,
                    {
                      backgroundColor: selectedFloorFilter === fl ? colors.primary : colors.surface,
                      borderColor: selectedFloorFilter === fl ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedFloorFilter(fl)}
                >
                  <Text style={[styles.floorPillText, { color: selectedFloorFilter === fl ? '#FFFFFF' : colors.textPrimary }]}>
                    Floor {fl} (Beds {(fl - 1) * 10 + 1}-{fl * 10})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Legend */}
            <View style={[styles.legendRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Alert Active</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Med En Route</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Occupied</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Vacant</Text>
              </View>
            </View>

            {/* 10 Beds for Selected Floor */}
            <View style={styles.bedsGrid}>
              {allBeds
                .filter((b) => b.floor === selectedFloorFilter)
                .map((bed) => {
                  const borderColor = bed.hasAlert
                    ? colors.danger
                    : bed.hasActiveDelivery
                    ? colors.primary
                    : bed.isOccupied
                    ? colors.success
                    : colors.border;

                  const bgColor = bed.hasAlert
                    ? colors.dangerLight
                    : bed.hasActiveDelivery
                    ? colors.primaryLight
                    : bed.isOccupied
                    ? colors.surface
                    : colors.surfaceElevated;

                  return (
                    <TouchableOpacity
                      key={bed.bedNum}
                      style={[styles.bedTile, { backgroundColor: bgColor, borderColor }]}
                      onPress={() => {
                        Alert.alert(
                          `Bed #${bed.bedNum} Details`,
                          `Floor: ${bed.floor}\nPatient: ${bed.patientName}\nOccupancy: ${bed.isOccupied ? 'OCCUPIED' : 'VACANT'}\nDistress Alert: ${bed.hasAlert ? 'ACTIVE CODE' : 'NONE'}\nMEDIBOT Delivery: ${bed.hasActiveDelivery ? 'IN TRANSIT' : 'NONE'}`
                        );
                      }}
                    >
                      <View style={styles.bedTileTop}>
                        <Text style={[styles.bedNumText, { color: colors.textPrimary }]}>#{bed.bedNum}</Text>
                        {bed.hasAlert && (
                          <MaterialCommunityIcons name="alarm-light" size={14} color={colors.danger} />
                        )}
                        {bed.hasActiveDelivery && (
                          <MaterialCommunityIcons name="robot" size={14} color={colors.primary} />
                        )}
                      </View>
                      <Text style={[styles.bedPatientText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {bed.patientName}
                      </Text>
                      <Text style={[styles.bedStatusText, { color: borderColor }]}>
                        {bed.hasAlert ? 'ALERT' : bed.hasActiveDelivery ? 'DELIVERY' : bed.isOccupied ? 'OCCUPIED' : 'VACANT'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        {/* TAB 3: LIFT IOT TELEMETRY */}
        {activeTab === 'LIFT_IOT' && (
          <View style={styles.sectionGap}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <MaterialCommunityIcons name="elevator" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>5-Floor Elevator Optocoupler Relay Bridge</Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Hardware transit handshake, floor interlocks & cabin alignment
                  </Text>
                </View>
              </View>

              {/* 5 Floors Relay Status */}
              <View style={styles.liftFloorsColumn}>
                {[5, 4, 3, 2, 1].map((floorNum) => {
                  const isCurrentFloor = currentFloor === floorNum;
                  const isRelayActive = lift.targetFloor === floorNum;
                  return (
                    <View
                      key={floorNum}
                      style={[
                        styles.floorRelayCard,
                        {
                          backgroundColor: isCurrentFloor ? colors.primaryLight : colors.surfaceElevated,
                          borderColor: isCurrentFloor ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View style={styles.floorRelayLeft}>
                        <View style={[styles.floorNumBubble, { backgroundColor: isCurrentFloor ? colors.primary : colors.border }]}>
                          <Text style={styles.floorNumText}>L{floorNum}</Text>
                        </View>
                        <View>
                          <Text style={[styles.floorRelayTitle, { color: colors.textPrimary }]}>
                            Hospital Floor #{floorNum}
                          </Text>
                          <Text style={[styles.floorRelaySub, { color: colors.textSecondary }]}>
                            {floorNum === 1
                              ? 'Ground Floor • Lobby & Emergency'
                              : floorNum === 2
                              ? 'Floor 2 • Cardiology & Inpatient Beds 11-20'
                              : floorNum === 3
                              ? 'Floor 3 • General Surgery Beds 21-30'
                              : floorNum === 4
                              ? 'Floor 4 • Post-Op ICU Beds 31-40'
                              : 'Floor 5 • Executive Suites Beds 41-50'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.floorRelayRight}>
                        {isCurrentFloor && (
                          <View style={[styles.pulseTag, { backgroundColor: colors.primary }]}>
                            <Text style={styles.pulseTagText}>CABIN HERE</Text>
                          </View>
                        )}
                        <Text style={[styles.relayStatusText, { color: isRelayActive ? colors.success : colors.textMuted }]}>
                          Relay: {isRelayActive ? 'ACTUATED (HIGH)' : 'IDLE (LOW)'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Safety Interlock Parameters */}
              <View style={[styles.safetyBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <View style={styles.safetyRow}>
                  <Text style={[styles.safetyLabel, { color: colors.textSecondary }]}>Door Status:</Text>
                  <Text style={[styles.safetyValue, { color: colors.success }]}>{lift.doorStatus}</Text>
                </View>
                <View style={styles.safetyRow}>
                  <Text style={[styles.safetyLabel, { color: colors.textSecondary }]}>Cabin Alignment:</Text>
                  <Text style={[styles.safetyValue, { color: colors.primary }]}>{lift.currentLiftFloor === currentFloor ? 'LEVEL' : 'IN_TRANSIT'}</Text>
                </View>
                <View style={styles.safetyRow}>
                  <Text style={[styles.safetyLabel, { color: colors.textSecondary }]}>Optocoupler Safety Interlock:</Text>
                  <Text style={[styles.safetyValue, { color: lift.isInterlocked ? colors.success : colors.danger }]}>
                    {lift.isInterlocked ? 'ENGAGED & VERIFIED' : 'STANDBY READY'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: STAFF & RBAC MANAGEMENT */}
        {activeTab === 'STAFF_RBAC' && (
          <View style={styles.sectionGap}>
            {/* Provisioning Form */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Provision New Staff Credential</Text>

              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Staff Full Name (e.g., Dr. Rajesh Gupta)"
                placeholderTextColor={colors.textMuted}
                value={newStaffName}
                onChangeText={setNewStaffName}
              />

              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Enterprise Email (e.g., r.gupta@hospital.com)"
                placeholderTextColor={colors.textMuted}
                value={newStaffEmail}
                onChangeText={setNewStaffEmail}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Department (e.g., Neurology, Ward 3)"
                placeholderTextColor={colors.textMuted}
                value={newStaffDept}
                onChangeText={setNewStaffDept}
              />

              {/* Role Select Buttons */}
              <Text style={[styles.roleSelectLabel, { color: colors.textSecondary }]}>SELECT ASSIGNED ROLE:</Text>
              <View style={styles.roleSelectRow}>
                {(['DOCTOR', 'NURSE', 'CHEMIST', 'PEON'] as UserRole[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleSelectBtn,
                      {
                        backgroundColor: newStaffRole === r ? colors.primary : colors.surfaceElevated,
                        borderColor: newStaffRole === r ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setNewStaffRole(r)}
                  >
                    <Text style={[styles.roleSelectBtnText, { color: newStaffRole === r ? '#FFFFFF' : colors.textPrimary }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.provisionSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddStaff}
              >
                <Feather name="user-plus" size={16} color="#FFFFFF" />
                <Text style={styles.provisionBtnText}>PROVISION & ISSUE CREDENTIAL</Text>
              </TouchableOpacity>
            </View>

            {/* Staff Directory List */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Hospital User Directory ({userAccounts.length})</Text>

              {userAccounts.map((user) => (
                <View key={user.id} style={[styles.userRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
                      <StatusBadge label={user.role} variant={user.role === 'DOCTOR' ? 'danger' : user.role === 'CHEMIST' ? 'primary' : 'warning'} size="sm" />
                    </View>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    <Text style={[styles.userDept, { color: colors.textMuted }]}>{user.department || 'General Care'}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.toggleStatusBtn,
                      {
                        backgroundColor: user.isActive ? colors.successLight : colors.dangerLight,
                        borderColor: user.isActive ? colors.success : colors.danger,
                      },
                    ]}
                    onPress={() => toggleUserStatus(user.id)}
                  >
                    <Text style={[styles.toggleStatusText, { color: user.isActive ? colors.success : colors.danger }]}>
                      {user.isActive ? 'ACTIVE' : 'REVOKED'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  sectionGap: {
    gap: Spacing.md,
  },
  estopCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
  },
  estopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  estopTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  estopSub: {
    fontSize: 11,
    marginTop: 2,
  },
  estopActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  estopActionBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyNotice: {
    fontSize: 12,
    marginTop: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  dOrderNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  dTarget: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  dPrescribed: {
    fontSize: 10,
  },
  dPin: {
    fontSize: 10,
    fontWeight: '700',
  },
  matrixHeaderRow: {
    marginBottom: Spacing.xs,
  },
  floorFilterRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  floorPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  floorPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bedsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bedTile: {
    width: '48%',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1.5,
  },
  bedTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedNumText: {
    fontSize: 14,
    fontWeight: '900',
  },
  bedPatientText: {
    fontSize: 10,
    marginTop: 2,
  },
  bedStatusText: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  liftFloorsColumn: {
    gap: Spacing.xs + 2,
  },
  floorRelayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  floorRelayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  floorNumBubble: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  floorRelayTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  floorRelaySub: {
    fontSize: 10,
  },
  floorRelayRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  pulseTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  pulseTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  relayStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  safetyBox: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
    gap: 4,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  safetyLabel: {
    fontSize: 11,
  },
  safetyValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  inputField: {
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
  },
  roleSelectLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  roleSelectRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleSelectBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  provisionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  provisionBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 11,
  },
  userDept: {
    fontSize: 10,
  },
  toggleStatusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  toggleStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
