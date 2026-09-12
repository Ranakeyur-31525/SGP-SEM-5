import { create } from 'zustand';
import { DeliveryOrder, DeliveryPriority, DeliveryStage, DrugItem } from '../types';
import { useRobotStore } from './useRobotStore';
import { useBillingStore } from './useBillingStore';

const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'DEL-8902',
    orderNumber: 'MB-2026-0892',
    targetFloor: 3,
    targetBed: 12,
    priority: 'EMERGENCY_STAT',
    status: 'IN_TRANSIT',
    items: [
      {
        drug: {
          id: 'DRG-001',
          name: 'Adrenaline (Epinephrine) 1mg/mL',
          category: 'CRITICAL_CARE',
          dosage: '1mg/1mL Ampoule',
          quantity: 18,
          unit: 'ampoules',
          pricePerUnit: 145.0,
          minThresholdPercent: 20,
          absoluteFloorUnits: 20,
          isHighRisk: true,
        },
        quantity: 2,
      },
      {
        drug: {
          id: 'DRG-002',
          name: 'Atropine Sulfate 0.6mg/mL',
          category: 'CRITICAL_CARE',
          dosage: '0.6mg/mL Ampoule',
          quantity: 24,
          unit: 'ampoules',
          pricePerUnit: 85.0,
          minThresholdPercent: 20,
          absoluteFloorUnits: 15,
          isHighRisk: true,
        },
        quantity: 1,
      },
    ],
    passcode: '4821', // 4-digit PIN for SG90 servo unlock
    prescribedBy: 'Dr. Anita Mehta, MD (ICU)',
    dispensedBy: 'Rahul Verma (R.Ph)',
    createdAt: new Date(Date.now() - 12 * 60000).toLocaleTimeString(),
    currentFloor: 3,
    currentJunction: 4,
    estimatedTransitSeconds: 78,
  },
  {
    id: 'DEL-8901',
    orderNumber: 'MB-2026-0891',
    targetFloor: 2,
    targetBed: 24,
    priority: 'NORMAL',
    status: 'ORDER_PLACED',
    items: [
      {
        drug: {
          id: 'DRG-005',
          name: 'Normal Saline (0.9% NaCl)',
          category: 'IV_FLUID',
          dosage: '500 mL IV Infusion',
          quantity: 120,
          unit: 'bottles',
          pricePerUnit: 60.0,
          minThresholdPercent: 15,
          absoluteFloorUnits: 30,
          isHighRisk: false,
        },
        quantity: 2,
      },
    ],
    passcode: '7139',
    prescribedBy: 'Dr. Sandeep Rao',
    dispensedBy: 'Rahul Verma (R.Ph)',
    createdAt: new Date(Date.now() - 25 * 60000).toLocaleTimeString(),
    currentFloor: 1,
    currentJunction: 0,
    estimatedTransitSeconds: 240,
  },
  {
    id: 'DEL-8898',
    orderNumber: 'MB-2026-0889',
    targetFloor: 4,
    targetBed: 38,
    priority: 'NORMAL',
    status: 'RETURN_TO_DOCK',
    items: [
      {
        drug: {
          id: 'DRG-003',
          name: 'Meropenem 1g IV Infusion',
          category: 'ANTIBIOTIC',
          dosage: '1g Vial',
          quantity: 45,
          unit: 'vials',
          pricePerUnit: 890.0,
          minThresholdPercent: 20,
          absoluteFloorUnits: 15,
          isHighRisk: false,
        },
        quantity: 1,
      },
    ],
    passcode: '1904',
    prescribedBy: 'Dr. Anita Mehta, MD',
    dispensedBy: 'Rahul Verma (R.Ph)',
    receivedBy: 'Sarah Joseph, RN',
    createdAt: new Date(Date.now() - 65 * 60000).toLocaleTimeString(),
    arrivedAt: new Date(Date.now() - 40 * 60000).toLocaleTimeString(),
    completedAt: new Date(Date.now() - 35 * 60000).toLocaleTimeString(),
    currentFloor: 1,
    currentJunction: 1,
    estimatedTransitSeconds: 0,
  },
];

interface DeliveryState {
  deliveries: DeliveryOrder[];
  activeDeliveryId: string;
  createDelivery: (params: {
    targetFloor: number;
    targetBed: number;
    priority: DeliveryPriority;
    items: Array<{ drug: DrugItem; quantity: number }>;
    prescribedBy: string;
  }) => DeliveryOrder;
  advanceDeliveryStage: (deliveryId: string, nextStage: DeliveryStage) => void;
  verifyAndUnlockHatch: (deliveryId: string, inputPin: string) => { success: boolean; message: string };
  getActiveDelivery: () => DeliveryOrder | undefined;
  setActiveDeliveryId: (id: string) => void;
}

export const STAGES_FLOW: DeliveryStage[] = [
  'ORDER_PLACED',
  'CHEMIST_LOADED',
  'IN_TRANSIT',
  'ARRIVED_AT_BED',
  'PASSCODE_UNLOCKED',
  'RETURN_TO_DOCK',
];

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: INITIAL_DELIVERIES,
  activeDeliveryId: 'DEL-8902',

  createDelivery: ({ targetFloor, targetBed, priority, items, prescribedBy }) => {
    // Generate secure 4-digit numeric passcode
    const passcode = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `DEL-${Math.floor(8900 + Math.random() * 100)}`;
    const newDelivery: DeliveryOrder = {
      id,
      orderNumber: `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      targetFloor,
      targetBed,
      priority,
      status: 'ORDER_PLACED',
      items,
      passcode,
      prescribedBy,
      createdAt: new Date().toLocaleTimeString(),
      currentFloor: 1,
      currentJunction: 0,
      estimatedTransitSeconds: targetFloor === 1 ? 90 : targetFloor * 60 + 45,
    };

    set((state) => ({
      deliveries: [newDelivery, ...state.deliveries],
      activeDeliveryId: id,
    }));

    return newDelivery;
  },

  advanceDeliveryStage: (deliveryId: string, nextStage: DeliveryStage) => {
    set((state) => ({
      deliveries: state.deliveries.map((d) => {
        if (d.id !== deliveryId) return d;
        const updated = { ...d, status: nextStage };
        if (nextStage === 'ARRIVED_AT_BED') {
          updated.arrivedAt = new Date().toLocaleTimeString();
        }
        if (nextStage === 'RETURN_TO_DOCK') {
          updated.completedAt = new Date().toLocaleTimeString();
        }
        return updated;
      }),
    }));

    // Synchronize robot hardware state
    const robot = useRobotStore.getState();
    if (nextStage === 'IN_TRANSIT') {
      robot.setRobotStatus('TRANSIT');
    } else if (nextStage === 'ARRIVED_AT_BED') {
      robot.setRobotStatus('ARRIVED_BED');
    } else if (nextStage === 'RETURN_TO_DOCK') {
      robot.setRobotStatus('RETURNING');
      robot.actuateHatchLock('LOCK');
    }
  },

  verifyAndUnlockHatch: (deliveryId: string, inputPin: string) => {
    const delivery = get().deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return { success: false, message: 'Delivery record not found' };
    }

    if (delivery.passcode !== inputPin) {
      return { success: false, message: 'Invalid 4-Digit Passcode. Access Denied.' };
    }

    // Passcode Valid: Actuate SG90 Servo Deadbolt Lock via MQTT
    useRobotStore.getState().actuateHatchLock('UNLOCK', inputPin);
    get().advanceDeliveryStage(deliveryId, 'PASSCODE_UNLOCKED');

    // Automatically inject Dynamic Hospital Bed Turnaround Billing into patient's EMR
    const billingItems = delivery.items.map((item) => ({
      name: item.drug.name,
      quantity: item.quantity,
      unitPrice: item.drug.pricePerUnit,
    }));
    useBillingStore
      .getState()
      .injectBedTurnaroundCharge(delivery.targetBed, delivery.orderNumber, billingItems);

    return { success: true, message: 'Passcode Verified. SG90 Deadbolt Hatch Actuated & Unlocked.' };
  },

  getActiveDelivery: () => {
    const { deliveries, activeDeliveryId } = get();
    return deliveries.find((d) => d.id === activeDeliveryId) || deliveries[0];
  },

  setActiveDeliveryId: (id: string) => set({ activeDeliveryId: id }),
}));
