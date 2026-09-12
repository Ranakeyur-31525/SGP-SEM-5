import { create } from 'zustand';
import { useRobotStore as useRobotCoreStore } from '../stores/useRobotStore';

export interface RobotTelemetryState {
  distanceCm: number;
  obstacleWarning: boolean;
  criticalHalt: boolean;
  junction: number;
  floor: number;
  targetBed: number;
  hatchLocked: boolean;
  emergencyStop: boolean;
  batteryPercentage: number;
  batteryVoltage: number;
  status: 'IDLE' | 'TRANSIT' | 'LIFT_WAIT' | 'ARRIVED_BED' | 'UNLOCKED' | 'EMERGENCY_STOP';
  
  // Actions & MQTT dispatchers
  setLidarDistance: (distanceCm: number) => void;
  setNavigationProgress: (floor: number, junction: number) => void;
  unlockHatchWithPasscode: (passcode: string) => boolean;
  lockHatch: () => void;
  triggerEmergencyStop: () => void;
  resetEmergencyStop: () => void;
  stepSimulation: () => void;
}

export const useRobotStore = create<RobotTelemetryState>((set, get) => ({
  distanceCm: 145,
  obstacleWarning: false,
  criticalHalt: false,
  junction: 4,
  floor: 3,
  targetBed: 12,
  hatchLocked: true,
  emergencyStop: false,
  batteryPercentage: 84,
  batteryVoltage: 7.54,
  status: 'TRANSIT',

  setLidarDistance: (distanceCm: number) => {
    const obstacleWarning = distanceCm < 100;
    const criticalHalt = distanceCm <= 30;
    set((state) => ({
      distanceCm,
      obstacleWarning,
      criticalHalt,
      status: criticalHalt ? 'EMERGENCY_STOP' : (state.status === 'EMERGENCY_STOP' && !state.emergencyStop ? 'TRANSIT' : state.status),
    }));

    // Mirror to core store
    useRobotCoreStore.getState().updateLidarTelemetry(distanceCm);
  },

  setNavigationProgress: (floor: number, junction: number) => {
    set({ floor, junction });
    useRobotCoreStore.getState().setFloorAndJunction(floor, junction);
  },

  unlockHatchWithPasscode: (passcode: string) => {
    console.log(`[MQTT: medibot/hatch/control] -> { "action": "UNLOCK", "passcode": "${passcode}" }`);
    set({ hatchLocked: false });
    useRobotCoreStore.getState().actuateHatchLock('UNLOCK', passcode);
    return true;
  },

  lockHatch: () => {
    console.log('[MQTT: medibot/hatch/control] -> { "action": "LOCK" }');
    set({ hatchLocked: true });
    useRobotCoreStore.getState().actuateHatchLock('LOCK');
  },

  triggerEmergencyStop: () => {
    console.log('[MQTT: medibot/safety/estop] -> { "emergencyStop": true }');
    set({ emergencyStop: true, criticalHalt: true, status: 'EMERGENCY_STOP' });
    useRobotCoreStore.getState().triggerEmergencyStop();
  },

  resetEmergencyStop: () => {
    console.log('[MQTT: medibot/safety/estop] -> { "emergencyStop": false }');
    set({ emergencyStop: false, criticalHalt: false, status: 'IDLE' });
    useRobotCoreStore.getState().resetEmergencyStop();
  },

  stepSimulation: () => {
    const current = get();
    if (current.emergencyStop || current.criticalHalt) return;

    // Small jitter
    const jitter = Math.floor(Math.random() * 7) - 3;
    let dist = current.distanceCm + jitter;
    if (dist > 220) dist = 220;
    if (dist < 40) dist = 45;

    const nextJunction = Math.random() > 0.6 ? (current.junction + 1) % 11 : current.junction;
    get().setLidarDistance(dist);
    get().setNavigationProgress(current.floor, nextJunction);
  },
}));
