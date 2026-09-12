// Roles & Permissions
export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'CHEMIST' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBed?: number;  // 1 to 50 for Patient
  allocatedFloor?: number; // 1 to 5 for Patient
  dutyShift?: 'Day' | 'Night'; // for Doctor, Nurse, Staff
  department?: string;
  isActive: boolean;
  avatarIcon?: string;
}

// Pharmacy Order Intake System (Parity with MEDIBOT backend model)
export interface PharmacyOrderItem {
  name: string;
  price: number;
}

export interface PharmacyOrder {
  order_id: string;
  patient_id: string;
  patient_name: string;
  patient_floor: number;
  patient_bed: number;
  ordered_by_role: 'user' | 'doctor' | 'staff';
  order_type: 'text_input' | 'prescription_upload';
  prescription_image_url?: string | null;
  items_list: string[];
  items: PharmacyOrderItem[];
  subtotal: number;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

// Delivery Lifecycle
export type DeliveryStage = 
  | 'ORDER_PLACED'
  | 'CHEMIST_LOADED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_BED'
  | 'PASSCODE_UNLOCKED'
  | 'RETURN_TO_DOCK';

export type DeliveryPriority = 'NORMAL' | 'EMERGENCY_STAT';

export interface DrugItem {
  id: string;
  name: string;
  category: 'CRITICAL_CARE' | 'ANTIBIOTIC' | 'ANALGESIC' | 'IV_FLUID' | 'EMERGENCY_CARDIAC';
  dosage: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  minThresholdPercent: number; // e.g. 20%
  absoluteFloorUnits: number;  // e.g. 20 units
  isHighRisk: boolean;
}
export interface DrugApprovalRequest {
  id: string;
  requested_by: string;
  requested_by_role: 'DOCTOR' | 'STAFF';
  drug_name: string;
  recommended_dosage: string;
  category: 'CRITICAL_CARE' | 'ANTIBIOTIC' | 'ANALGESIC' | 'IV_FLUID' | 'EMERGENCY_CARDIAC' | 'SURGICAL_SUPPLIES' | 'OTHER';
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  targetFloor: number; // 1 to 5
  targetBed: number;   // 1 to 50
  priority: DeliveryPriority;
  status: DeliveryStage;
  items: Array<{ drug: DrugItem; quantity: number }>;
  passcode: string;    // 4-digit PIN e.g. "4821"
  prescribedBy: string;
  dispensedBy?: string;
  receivedBy?: string;
  createdAt: string;
  arrivedAt?: string;
  completedAt?: string;
  currentFloor: number;
  currentJunction: number;
  estimatedTransitSeconds: number;
}

// Hardware & Sensor Telemetry
export type HatchLockState = 'LOCKED' | 'UNLOCKED';
export type LiftRelayState = 'IDLE' | 'ACTIVE' | 'CALLED' | 'ARRIVED';
export type RobotMotionStatus = 'IDLE' | 'TRANSIT' | 'LIFT_WAIT' | 'LIFT_TRANSIT' | 'ARRIVED_BED' | 'UNLOCKED' | 'RETURNING' | 'EMERGENCY_STOP';

export interface LidarTelemetry {
  distanceCm: number;        // From TF-Luna ToF (cm)
  safetyThresholdWarn: 100; // < 100cm warns
  safetyThresholdHalt: 30;  // <= 30cm critical brake halt
  brakeEngaged: boolean;
  signalQuality: number;     // 0 - 100%
  timestamp: string;
}

export interface IrSensorState {
  sensors: [boolean, boolean, boolean, boolean, boolean]; // 5-channel line tracker [L2, L1, C, R1, R2]
  onNodeJunction: boolean;
}

export interface LiftTelemetry {
  targetFloor: number;
  currentLiftFloor: number;
  relayState: LiftRelayState;
  doorStatus: 'CLOSED' | 'OPEN';
  isInterlocked: boolean;
}

export interface PowerTelemetry {
  batteryVoltage: number;    // e.g. 7.4V nominal (dual 18650)
  batteryPercentage: number; // 0 - 100%
  stepDownRail5V: number;    // LM2596 step-down rail (target 5.0V)
  isRailNormal: boolean;
  estimatedRuntimeMinutes: number;
  chargingState: 'DISCHARGING' | 'CHARGING' | 'DOCKED';
}

export interface RobotState {
  robotId: string;
  status: RobotMotionStatus;
  currentFloor: number;
  currentJunction: number; // 0 to 10
  targetBed: number;
  hatchState: HatchLockState;
  lidar: LidarTelemetry;
  irArray: IrSensorState;
  lift: LiftTelemetry;
  power: PowerTelemetry;
  emergencyStop: boolean;
  activeDeliveryId?: string;
  totalMissionsCompleted: number;
}

// Calling Matrix Alert
export type AlertRecipient = 'DOCTOR' | 'NURSE' | 'PEON';
export type AlertSeverity = 'CODE_RED' | 'ASSISTANCE' | 'SERVICE';

export interface CallingAlert {
  id: string;
  bedNumber: number;
  floor: number;
  recipient: AlertRecipient;
  severity: AlertSeverity;
  patientName: string;
  reason: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// System Logs & Feed
export type AlertTier = 'TIER_1_CRITICAL' | 'TIER_2_ESSENTIAL' | 'TIER_3_ROUTINE';

export interface SystemAlertItem {
  id: string;
  tier: AlertTier;
  title: string;
  message: string;
  timestamp: string;
  source: 'HARDWARE' | 'LIDAR' | 'PHARMACY' | 'EMERGENCY';
}

// Billing
export interface PatientBill {
  patientId: string;
  bedNumber: number;
  patientName: string;
  roomCharges: number;
  medicineCharges: number;
  robotLogisticsFee: number;
  subtotal: number;
  tax: number;
  total: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}
