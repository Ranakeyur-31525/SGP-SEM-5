import { create } from 'zustand';
import { RobotState, LidarTelemetry, RobotMotionStatus, HatchLockState, LiftRelayState } from '../types';

interface RobotStore extends RobotState {
  // Action Handlers
  updateLidarTelemetry: (distanceCm: number, signalQuality?: number) => void;
  updateIrSensorState: (sensors: [boolean, boolean, boolean, boolean, boolean], onNode: boolean) => void;
  setRobotStatus: (status: RobotMotionStatus) => void;
  setFloorAndJunction: (floor: number, junction: number) => void;
  triggerEmergencyStop: () => void;
  resetEmergencyStop: () => void;
  actuateHatchLock: (action: 'LOCK' | 'UNLOCK', passcode?: string) => boolean;
  commandLift: (targetFloor: number) => void;
  stepSimulationTick: () => void;
  setManualLidarDistance: (distanceCm: number) => void;
}

const INITIAL_ROBOT_STATE: RobotState = {
  robotId: 'ESP32-MEDIBOT-01',
  status: 'TRANSIT',
  currentFloor: 3,
  currentJunction: 4,
  targetBed: 12,
  hatchState: 'LOCKED',
  lidar: {
    distanceCm: 142,
    safetyThresholdWarn: 100,
    safetyThresholdHalt: 30,
    brakeEngaged: false,
    signalQuality: 96,
    timestamp: new Date().toLocaleTimeString(),
  },
  irArray: {
    sensors: [false, false, true, false, false], // Center sensor aligned on black track
    onNodeJunction: false,
  },
  lift: {
    targetFloor: 3,
    currentLiftFloor: 3,
    relayState: 'IDLE',
    doorStatus: 'CLOSED',
    isInterlocked: false,
  },
  power: {
    batteryVoltage: 7.54, // 2x 18650 Li-ion series
    batteryPercentage: 82,
    stepDownRail5V: 5.04, // LM2596 step down output
    isRailNormal: true,
    estimatedRuntimeMinutes: 145, // ~2.4 hrs
    chargingState: 'DISCHARGING',
  },
  emergencyStop: false,
  activeDeliveryId: 'DEL-8902',
  totalMissionsCompleted: 238,
};

export const useRobotStore = create<RobotStore>((set, get) => ({
  ...INITIAL_ROBOT_STATE,

  updateLidarTelemetry: (distanceCm: number, signalQuality = 95) => {
    const brakeEngaged = distanceCm <= 30;
    set((state) => ({
      lidar: {
        ...state.lidar,
        distanceCm,
        brakeEngaged,
        signalQuality,
        timestamp: new Date().toLocaleTimeString(),
      },
      // Automatically halt robot if critical obstacle detected within 30cm
      status: brakeEngaged ? 'EMERGENCY_STOP' : (state.status === 'EMERGENCY_STOP' && !state.emergencyStop ? 'TRANSIT' : state.status),
    }));
  },

  setManualLidarDistance: (distanceCm: number) => {
    get().updateLidarTelemetry(distanceCm);
  },

  updateIrSensorState: (sensors, onNode) => {
    set({
      irArray: {
        sensors,
        onNodeJunction: onNode,
      },
    });
  },

  setRobotStatus: (status) => set({ status }),

  setFloorAndJunction: (floor, junction) => set({ currentFloor: floor, currentJunction: junction }),

  triggerEmergencyStop: () => {
    set({
      emergencyStop: true,
      status: 'EMERGENCY_STOP',
    });
    console.log('[MQTT: medibot/safety/estop] -> { "emergencyStop": true, "reason": "MANUAL_BUTTON" }');
  },

  resetEmergencyStop: () => {
    set({
      emergencyStop: false,
      status: 'IDLE',
    });
    console.log('[MQTT: medibot/safety/estop] -> { "emergencyStop": false, "reason": "RESET" }');
  },

  actuateHatchLock: (action: 'LOCK' | 'UNLOCK', passcode?: string) => {
    if (action === 'UNLOCK') {
      console.log(`[MQTT: medibot/hatch/control] -> { "action": "UNLOCK", "passcode": "${passcode || '0000'}" }`);
      set({ hatchState: 'UNLOCKED' });
      return true;
    } else {
      console.log('[MQTT: medibot/hatch/control] -> { "action": "LOCK" }');
      set({ hatchState: 'LOCKED' });
      return true;
    }
  },

  commandLift: (targetFloor: number) => {
    console.log(`[MQTT: medibot/lift/command] -> { "targetFloor": ${targetFloor}, "relayState": "ACTIVE" }`);
    set((state) => ({
      lift: {
        ...state.lift,
        targetFloor,
        relayState: 'CALLED',
      },
      status: 'LIFT_WAIT',
    }));

    // Simulate lift travel
    setTimeout(() => {
      set((state) => ({
        lift: {
          ...state.lift,
          currentLiftFloor: targetFloor,
          relayState: 'ARRIVED',
          doorStatus: 'OPEN',
        },
        currentFloor: targetFloor,
        status: 'TRANSIT',
      }));
    }, 4000);
  },

  stepSimulationTick: () => {
    const { emergencyStop, lidar, status, currentJunction, hatchState } = get();
    if (emergencyStop || status === 'EMERGENCY_STOP' || status === 'IDLE' || status === 'ARRIVED_BED') return;

    // Small natural jitter for LiDAR TF-Luna reading
    const jitter = Math.floor(Math.random() * 9) - 4; // -4 to +4 cm
    let newDist = lidar.distanceCm + jitter;
    if (newDist > 240) newDist = 240;
    if (newDist < 40 && !lidar.brakeEngaged) newDist = 45; // keep above halt unless manually triggered

    // Simulate junction progress
    let nextJunction = currentJunction;
    if (Math.random() > 0.6) {
      nextJunction = (currentJunction + 1) % 11;
    }

    // Ir line jitter
    const irOptions: [boolean, boolean, boolean, boolean, boolean][] = [
      [false, false, true, false, false],
      [false, true, true, false, false],
      [false, false, true, true, false],
      [true, true, true, true, true], // Node junction
    ];
    const pickedIr = nextJunction !== currentJunction ? irOptions[3] : irOptions[Math.floor(Math.random() * 3)];

    set((state) => ({
      lidar: {
        ...state.lidar,
        distanceCm: newDist,
        timestamp: new Date().toLocaleTimeString(),
      },
      currentJunction: nextJunction,
      irArray: {
        sensors: pickedIr,
        onNodeJunction: pickedIr.every(Boolean),
      },
    }));
  },
}));
