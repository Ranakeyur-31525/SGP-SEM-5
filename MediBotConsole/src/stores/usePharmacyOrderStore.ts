import { create } from 'zustand';
import { PharmacyOrder, PharmacyOrderItem } from '../types';
import { useBillingStore } from './useBillingStore';

interface PharmacyOrderState {
  orders: PharmacyOrder[];
  placeOrder: (params: {
    patient_id: string;
    patient_name: string;
    patient_floor: number;
    patient_bed: number;
    ordered_by_role: 'user' | 'doctor' | 'staff';
    order_type: 'text_input' | 'prescription_upload';
    prescription_image_url?: string | null;
    items_list: string[];
  }) => PharmacyOrder;
  submitCalculation: (
    order_id: string,
    calculatedItems: PharmacyOrderItem[]
  ) => void;
  getOrdersForBed: (bedNumber: number) => PharmacyOrder[];
}

const INITIAL_PHARMACY_ORDERS: PharmacyOrder[] = [
  {
    order_id: 'ORD-9421',
    patient_id: 'usr_pat_12',
    patient_name: 'Ramesh Sharma',
    patient_floor: 2,
    patient_bed: 12,
    ordered_by_role: 'user',
    order_type: 'text_input',
    items_list: ['Paracetamol 650mg (Oral)', 'Saline D5 IV 500mL', 'Surgical Cotton Gauze Roll'],
    items: [],
    subtotal: 0,
    order_status: 'pending',
    createdAt: new Date(Date.now() - 20 * 60000).toLocaleTimeString(),
  },
  {
    order_id: 'ORD-9419',
    patient_id: 'usr_pat_24',
    patient_name: 'Kavita Singh',
    patient_floor: 2,
    patient_bed: 24,
    ordered_by_role: 'user',
    order_type: 'prescription_upload',
    prescription_image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop',
    items_list: ['Prescription Rx Attachment'],
    items: [
      { name: 'Paracetamol IV 1000mg Infusion', price: 220 },
      { name: 'Normal Saline 500mL', price: 120 },
      { name: 'MediBot Autonomous Delivery Fee', price: 50 },
    ],
    subtotal: 390,
    order_status: 'completed',
    createdAt: new Date(Date.now() - 75 * 60000).toLocaleTimeString(),
  },
  {
    order_id: 'ORD-9415',
    patient_id: 'usr_pat_05',
    patient_name: 'Kishore Kumar',
    patient_floor: 1,
    patient_bed: 5,
    ordered_by_role: 'staff',
    order_type: 'text_input',
    items_list: ['Insulin Glargine 100IU/mL', 'Syringes 1mL (Box of 10)'],
    items: [
      { name: 'Insulin Glargine 100IU/mL', price: 650 },
      { name: 'Syringes 1mL (Box of 10)', price: 180 },
    ],
    subtotal: 830,
    order_status: 'completed',
    createdAt: new Date(Date.now() - 140 * 60000).toLocaleTimeString(),
  },
];

export const usePharmacyOrderStore = create<PharmacyOrderState>((set, get) => ({
  orders: INITIAL_PHARMACY_ORDERS,

  placeOrder: ({
    patient_id,
    patient_name,
    patient_floor,
    patient_bed,
    ordered_by_role,
    order_type,
    prescription_image_url,
    items_list,
  }) => {
    const newOrder: PharmacyOrder = {
      order_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id,
      patient_name,
      patient_floor,
      patient_bed,
      ordered_by_role,
      order_type,
      prescription_image_url: prescription_image_url || null,
      items_list,
      items: [],
      subtotal: 0,
      order_status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    return newOrder;
  },

  submitCalculation: (order_id, calculatedItems) => {
    const subtotal = calculatedItems.reduce((acc, curr) => acc + (curr.price || 0), 0);

    set((state) => {
      const order = state.orders.find((o) => o.order_id === order_id);
      if (order) {
        // Automatically inject itemized charges into the patient's billing ledger
        calculatedItems.forEach((item) => {
          useBillingStore
            .getState()
            .addMedicineCharge(order.patient_bed, item.name, 1, item.price);
        });
      }

      return {
        orders: state.orders.map((o) =>
          o.order_id === order_id
            ? {
                ...o,
                items: calculatedItems,
                subtotal,
                order_status: 'completed',
              }
            : o
        ),
      };
    });
  },

  getOrdersForBed: (bedNumber: number) => {
    return get().orders.filter((o) => o.patient_bed === bedNumber);
  },
}));
