import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useRole } from '../hooks/useRole';
import { RoleGuard } from '../components/common/RoleGuard';
import { RootStackParamList, MainTabParamList } from './types';

// Screen Imports
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { DoctorOrderScreen } from '../screens/doctor/DoctorOrderScreen';
import { ChemistScreen } from '../screens/chemist/ChemistScreen';
import { PatientScreen } from '../screens/patient/PatientScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { InventoryManagementScreen } from '../screens/chemist/InventoryManagementScreen';
import { PharmacyOrderScreen } from '../screens/pharmacy/PharmacyOrderScreen';
import { DestinationSelectScreen } from '../screens/destination/DestinationSelectScreen';
import { CallingMatrixScreen } from '../screens/calling/CallingMatrixScreen';
import { DeliveryCreateScreen } from '../screens/delivery/DeliveryCreateScreen';
import { DeliveryDetailScreen } from '../screens/delivery/DeliveryDetailScreen';
import { RobotMonitoringScreen } from '../screens/robot/RobotMonitoringScreen';
import { ElevatorControlScreen } from '../screens/robot/ElevatorControlScreen';
import { AlertsFeedScreen } from '../screens/alerts/AlertsFeedScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { BatteryScreen } from '../screens/battery/BatteryScreen';
import { InventoryScreen } from '../screens/inventory/InventoryScreen';
import { LowStockScreen } from '../screens/inventory/LowStockScreen';
import { BillingScreen } from '../screens/billing/BillingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isPatient, isDoctor, isNurse, isChemist } = useRole();

  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  const commonTabOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      height: 56 + bottomInset,
      paddingBottom: bottomInset,
      paddingTop: 6,
    },
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.textMuted,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '700' as const,
    },
  };

  // 1. PATIENT: Bed 12 Isolated (Patient Screen, Calling Matrix, Meds Tracker, Bed Invoice, Profile)
  if (isPatient) {
    return (
      <Tab.Navigator screenOptions={commonTabOptions}>
        <Tab.Screen
          name="DashboardTab"
          component={PatientScreen}
          options={{
            tabBarLabel: 'My Bed 12',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bed-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MissionTab"
          component={CallingMatrixScreen}
          options={{
            tabBarLabel: 'Assistance',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="alarm-light-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="RobotTab"
          component={DeliveryDetailScreen}
          options={{
            tabBarLabel: 'Track Meds',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map-marker-distance" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="FacilityTab"
          component={BillingScreen}
          options={{
            tabBarLabel: 'My Invoice',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="receipt" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AdminTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 2. DOCTOR: STAT Bed Prescribe (Beds 1-50), Code Red Calling, Profile (Formulary Page completely removed)
  if (isDoctor) {
    return (
      <Tab.Navigator screenOptions={commonTabOptions}>
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Doctor Hub',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="doctor" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MissionTab"
          component={DoctorOrderScreen}
          options={{
            tabBarLabel: 'STAT Prescribe',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="clipboard-plus-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="FacilityTab"
          component={CallingMatrixScreen}
          options={{
            tabBarLabel: 'Code Red',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="alarm-light" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AdminTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="badge-account-horizontal-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 3. NURSE: Ward Station, Bed Calls, SG90 Hatch PIN Unlock, Ward Prescriptions, Profile
  if (isNurse) {
    return (
      <Tab.Navigator screenOptions={commonTabOptions}>
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Ward Station',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="hospital-building" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MissionTab"
          component={CallingMatrixScreen}
          options={{
            tabBarLabel: 'Bed Calls',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bell-ring-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="RobotTab"
          component={DeliveryDetailScreen}
          options={{
            tabBarLabel: 'Hatch Unlock',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="lock-open-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="FacilityTab"
          component={DoctorOrderScreen}
          options={{
            tabBarLabel: 'Ward Order',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="medical-bag" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AdminTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="badge-account-horizontal-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 4. CHEMIST: Chemist Hub (Proposals, Dispensary, Dispatch Bot, Low Stock)
  if (isChemist) {
    return (
      <Tab.Navigator screenOptions={commonTabOptions}>
        <Tab.Screen
          name="DashboardTab"
          component={ChemistScreen}
          options={{
            tabBarLabel: 'Dispensary',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flask-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MissionTab"
          component={InventoryManagementScreen}
          options={{
            tabBarLabel: 'Stock & Queue',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="store-cog" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="RobotTab"
          component={DeliveryCreateScreen}
          options={{
            tabBarLabel: 'Dispatch Bot',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="robot" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="FacilityTab"
          component={LowStockScreen}
          options={{
            tabBarLabel: 'Low Stock',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="alert-octagon-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AdminTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="badge-account-horizontal-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 5. ADMIN: Command Center (AdminScreen), 50 Beds Matrix, Telemetry Radar, Lift IoT, Staff & RBAC
  return (
    <Tab.Navigator screenOptions={commonTabOptions}>
      <Tab.Screen
        name="DashboardTab"
        component={AdminScreen}
        options={{
          tabBarLabel: 'Command',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-crown-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MissionTab"
        component={CallingMatrixScreen}
        options={{
          tabBarLabel: '50 Beds',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RobotTab"
        component={RobotMonitoringScreen}
        options={{
          tabBarLabel: 'Telemetry',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="radar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FacilityTab"
        component={ElevatorControlScreen}
        options={{
          tabBarLabel: 'Lift IoT',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="elevator-passenger" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminTab"
        component={UserManagementScreen}
        options={{
          tabBarLabel: 'Staff & RBAC',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      {/* 1. Splash / Welcome Screen */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/* 2. Public Hospital Landing Overview */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* 3. Auth Gateway with 1-Tap Persona Switcher */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 4. Role-Gated Main Bottom Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Dedicated Screens */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Chemist" component={ChemistScreen} />
      <Stack.Screen name="Patient" component={PatientScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />

      {/* Doctor STAT Prescribe */}
      <Stack.Screen name="DoctorOrder">
        {(props) => (
          <RoleGuard
            allowedRoles={['DOCTOR', 'NURSE', 'ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Patients do not have prescribing or delivery ordering clearance."
          >
            <DoctorOrderScreen {...props} />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Chemist Stock Restock & Proposal Approvals */}
      <Stack.Screen name="InventoryManagement">
        {(props) => (
          <RoleGuard
            allowedRoles={['CHEMIST', 'ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Pharmacy stock replenishment and SKU management is strictly restricted to Chemists."
          >
            <InventoryManagementScreen {...props} />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Pharmacy Order Desk */}
      <Stack.Screen name="PharmacyOrder">
        {(props) => (
          <RoleGuard
            allowedRoles={['CHEMIST', 'DOCTOR', 'NURSE', 'ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Patients do not have direct access to hospital pharmacy ordering."
          >
            <PharmacyOrderScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Facility Destination (50 Beds Matrix) */}
      <Stack.Screen name="DestinationSelect" component={DestinationSelectScreen} />

      {/* Live Delivery Detail & Hatch Passcode Unlock */}
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />

      {/* Fleet Monitoring & Telemetry */}
      <Stack.Screen name="RobotMonitoring">
        {(props) => (
          <RoleGuard
            allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'CHEMIST']}
            navigation={props.navigation}
            fallbackMessage="Bedside patients do not have access to raw robot telemetry controls."
          >
            <RobotMonitoringScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Calling Matrix */}
      <Stack.Screen name="CallingMatrix" component={CallingMatrixScreen} />

      {/* Formulary Inventory */}
      <Stack.Screen name="Inventory">
        {(props) => (
          <RoleGuard
            allowedRoles={['CHEMIST', 'DOCTOR', 'NURSE', 'ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Patients cannot browse hospital drug stocks."
          >
            <InventoryScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Low Stock Warning Dashboard */}
      <Stack.Screen name="LowStock">
        {(props) => (
          <RoleGuard
            allowedRoles={['CHEMIST', 'ADMIN', 'DOCTOR']}
            navigation={props.navigation}
            fallbackMessage="Pharmacy inventory replenishment is restricted to Chemist & Facility Staff."
          >
            <LowStockScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Patient & Turnaround Billing */}
      <Stack.Screen name="Billing" component={BillingScreen} />

      {/* System Alerts */}
      <Stack.Screen name="Alerts" component={AlertsFeedScreen} />
      <Stack.Screen name="AlertsFeed" component={AlertsFeedScreen} />

      {/* Profile & Credentials */}
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Settings */}
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* User Management & RBAC */}
      <Stack.Screen name="UserManagement">
        {(props) => (
          <RoleGuard
            allowedRoles={['ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Staff provisioning and role assignment requires Administrator privilege."
          >
            <UserManagementScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Delivery Create */}
      <Stack.Screen name="DeliveryCreate">
        {(props) => (
          <RoleGuard
            allowedRoles={['CHEMIST', 'ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Robot payload loading and dispatch is restricted to the Chemist."
          >
            <DeliveryCreateScreen {...props} />
          </RoleGuard>
        )}
      </Stack.Screen>

      {/* Elevator Control */}
      <Stack.Screen name="ElevatorControl">
        {(props) => (
          <RoleGuard
            allowedRoles={['ADMIN']}
            navigation={props.navigation}
            fallbackMessage="Elevator IoT override is strictly restricted to Facility Administrators."
          >
            <ElevatorControlScreen />
          </RoleGuard>
        )}
      </Stack.Screen>

      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Battery" component={BatteryScreen} />
    </Stack.Navigator>
  );
}

// Export RootNavigator alias for backward compatibility
export const RootNavigator = AppNavigator;
