import { create } from 'zustand';
import { AlertRecipient, AlertSeverity, CallingAlert } from '../types';

interface CallingMatrixState {
  alerts: CallingAlert[];
  triggerAlert: (params: {
    bedNumber: number;
    floor: number;
    recipient: AlertRecipient;
    severity: AlertSeverity;
    patientName: string;
    reason: string;
  }) => CallingAlert;
  resolveAlert: (alertId: string, resolvedBy: string) => void;
  getActiveAlertsForBed: (bedNumber: number) => CallingAlert[];
  getUnresolvedCount: (recipient?: AlertRecipient) => number;
}

const INITIAL_ALERTS: CallingAlert[] = [
  {
    id: 'ALT-101',
    bedNumber: 12,
    floor: 3,
    recipient: 'DOCTOR',
    severity: 'CODE_RED',
    patientName: 'Ramesh Sharma',
    reason: 'Acute Desaturation & Chest Tightness (SpO2 86%)',
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
    isResolved: false,
  },
  {
    id: 'ALT-102',
    bedNumber: 18,
    floor: 3,
    recipient: 'NURSE',
    severity: 'ASSISTANCE',
    patientName: 'Meena Kumari',
    reason: 'IV Cannula Occlusion Alarm',
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
    isResolved: false,
  },
  {
    id: 'ALT-103',
    bedNumber: 5,
    floor: 1,
    recipient: 'PEON',
    severity: 'SERVICE',
    patientName: 'Kishore Kumar',
    reason: 'Drinking Water Bottle Refill & Linen Spill',
    timestamp: new Date(Date.now() - 32 * 60000).toLocaleTimeString(),
    isResolved: true,
    resolvedAt: new Date(Date.now() - 10 * 60000).toLocaleTimeString(),
    resolvedBy: 'Sunil (Support Staff)',
  },
];

export const useCallingMatrixStore = create<CallingMatrixState>((set, get) => ({
  alerts: INITIAL_ALERTS,

  triggerAlert: ({ bedNumber, floor, recipient, severity, patientName, reason }) => {
    const newAlert: CallingAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      bedNumber,
      floor,
      recipient,
      severity,
      patientName,
      reason,
      timestamp: new Date().toLocaleTimeString(),
      isResolved: false,
    };

    console.log(`[CALLING-MATRIX PING] Alert dispatched to ${recipient} for Bed ${bedNumber}: ${reason}`);

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));

    return newAlert;
  },

  resolveAlert: (alertId: string, resolvedBy: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              isResolved: true,
              resolvedAt: new Date().toLocaleTimeString(),
              resolvedBy,
            }
          : a
      ),
    }));
  },

  getActiveAlertsForBed: (bedNumber: number) => {
    return get().alerts.filter((a) => a.bedNumber === bedNumber && !a.isResolved);
  },

  getUnresolvedCount: (recipient?: AlertRecipient) => {
    return get().alerts.filter((a) => !a.isResolved && (!recipient || a.recipient === recipient)).length;
  },
}));
