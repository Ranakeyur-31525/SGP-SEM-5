export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  Chemist: undefined;
  Patient: undefined;
  Admin: undefined;
  DoctorOrder: undefined;
  InventoryManagement: undefined;
  PharmacyOrder: undefined;
  DestinationSelect: undefined;
  CallingMatrix: undefined;
  DeliveryCreate: { defaultPriority?: 'NORMAL' | 'EMERGENCY_STAT' } | undefined;
  DeliveryDetail: { deliveryId?: string; autoOpenPin?: boolean } | undefined;
  RobotMonitoring: undefined;
  ElevatorControl: undefined;
  Alerts: undefined;
  AlertsFeed: undefined;
  History: undefined;
  Battery: undefined;
  Inventory: undefined;
  LowStock: undefined;
  Billing: { bedNumber?: number } | undefined;
  Profile: undefined;
  Settings: undefined;
  UserManagement: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  MissionTab: undefined;
  RobotTab: undefined;
  FacilityTab: undefined;
  AdminTab: undefined;
};
