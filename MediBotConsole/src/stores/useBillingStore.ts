import { create } from 'zustand';
import { PatientBill } from '../types';

export interface DischargeRequest {
  id: string;
  bedNumber: number;
  patientName: string;
  doctorName: string;
  doctorRole: string;
  clinicalSummary: string;
  recommendedAt: string;
  status: 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  resolvedAt?: string;
}

interface BillingState {
  bills: Record<number, PatientBill>; // Keyed by bedNumber
  dischargeRequests: DischargeRequest[];
  getBillForBed: (bedNumber: number) => PatientBill;
  getDischargeRequestForBed: (bedNumber: number) => DischargeRequest | undefined;
  addMedicineCharge: (bedNumber: number, description: string, quantity: number, unitPrice: number) => void;
  addDeliveryFee: (bedNumber: number) => void;
  injectBedTurnaroundCharge: (
    bedNumber: number,
    orderNumber: string,
    items: Array<{ name: string; quantity: number; unitPrice: number }>
  ) => void;
  requestDischarge: (
    bedNumber: number,
    doctorName: string,
    clinicalSummary: string,
    doctorRole?: string
  ) => { success: boolean; message: string; request?: DischargeRequest };
  approveAndDischarge: (
    requestId: string,
    userRole: string,
    adminNotes?: string
  ) => { success: boolean; message: string };
  rejectDischarge: (
    requestId: string,
    userRole: string,
    reason: string
  ) => { success: boolean; message: string };
  dischargeAndSettle: (bedNumber: number, userRole: string) => { success: boolean; message: string };
}

const INITIAL_BILLS: Record<number, PatientBill> = {
  12: {
    patientId: 'PAT-2026-0412',
    bedNumber: 12,
    patientName: 'Ramesh Sharma',
    roomCharges: 3600.0, // 3 days ICU bed
    medicineCharges: 1845.0,
    robotLogisticsFee: 150.0, // 3 autonomous missions @ $50
    subtotal: 5595.0,
    tax: 279.75, // 5% GST
    total: 5874.75,
    lineItems: [
      { description: 'Cardiology ICU Bed (Per Diem x 3)', quantity: 3, unitPrice: 1200.0, total: 3600.0 },
      { description: 'Adrenaline 1mg/mL Ampoule (STAT Delivery)', quantity: 2, unitPrice: 145.0, total: 290.0 },
      { description: 'Meropenem 1g IV Infusion', quantity: 1, unitPrice: 890.0, total: 890.0 },
      { description: 'Atropine Sulfate 0.6mg/mL Ampoule', quantity: 1, unitPrice: 85.0, total: 85.0 },
      { description: 'Normal Saline (0.9% NaCl) 500mL', quantity: 3, unitPrice: 60.0, total: 180.0 },
      { description: 'MediBot ESP32 Autonomous Sterilized Dispatch Fee', quantity: 3, unitPrice: 50.0, total: 150.0 },
    ],
  },
  24: {
    patientId: 'PAT-2026-0424',
    bedNumber: 24,
    patientName: 'Kavita Singh',
    roomCharges: 1800.0,
    medicineCharges: 540.0,
    robotLogisticsFee: 50.0,
    subtotal: 2390.0,
    tax: 119.5,
    total: 2509.5,
    lineItems: [
      { description: 'Semi-Private Bed (Per Diem x 2)', quantity: 2, unitPrice: 900.0, total: 1800.0 },
      { description: 'Paracetamol IV 1000mg Infusion', quantity: 2, unitPrice: 110.0, total: 220.0 },
      { description: 'Normal Saline 500mL', quantity: 2, unitPrice: 60.0, total: 120.0 },
      { description: 'MediBot Autonomous Delivery Fee', quantity: 1, unitPrice: 50.0, total: 50.0 },
    ],
  },
};

const INITIAL_DISCHARGE_REQUESTS: DischargeRequest[] = [
  {
    id: 'DCR-0412',
    bedNumber: 12,
    patientName: 'Ramesh Sharma',
    doctorName: 'Dr. Anita Mehta, MD',
    doctorRole: 'Attending Cardiologist',
    clinicalSummary: 'Post-PTCA recovery successful. Vitals stable (BP 122/78, SpO2 98%). Patient is clinically stable and cleared for discharge.',
    recommendedAt: '10:15 AM Today',
    status: 'PENDING_ADMIN_APPROVAL',
  },
];

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: INITIAL_BILLS,
  dischargeRequests: INITIAL_DISCHARGE_REQUESTS,

  getBillForBed: (bedNumber: number) => {
    const bill = get().bills[bedNumber];
    if (bill) return bill;

    // Fallback new bed invoice
    return {
      patientId: `PAT-2026-${bedNumber.toString().padStart(4, '0')}`,
      bedNumber,
      patientName: `Patient (Bed ${bedNumber})`,
      roomCharges: 1200.0,
      medicineCharges: 0.0,
      robotLogisticsFee: 0.0,
      subtotal: 1200.0,
      tax: 60.0,
      total: 1260.0,
      lineItems: [
        { description: 'Standard Inpatient Bed (Day 1)', quantity: 1, unitPrice: 1200.0, total: 1200.0 },
      ],
    };
  },

  getDischargeRequestForBed: (bedNumber: number) => {
    return get().dischargeRequests.find(
      (r) => r.bedNumber === bedNumber && r.status === 'PENDING_ADMIN_APPROVAL'
    );
  },

  addMedicineCharge: (bedNumber, description, quantity, unitPrice) => {
    const current = get().getBillForBed(bedNumber);
    const lineTotal = quantity * unitPrice;
    const newLineItems = [
      ...current.lineItems,
      { description, quantity, unitPrice, total: lineTotal },
    ];
    const newMedCharges = current.medicineCharges + lineTotal;
    const subtotal = current.roomCharges + newMedCharges + current.robotLogisticsFee;
    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    set((state) => ({
      bills: {
        ...state.bills,
        [bedNumber]: {
          ...current,
          medicineCharges: newMedCharges,
          subtotal,
          tax,
          total,
          lineItems: newLineItems,
        },
      },
    }));
  },

  addDeliveryFee: (bedNumber) => {
    const current = get().getBillForBed(bedNumber);
    const fee = 50.0;
    const newLineItems = [
      ...current.lineItems,
      { description: 'MediBot Autonomous Dispatch Fee', quantity: 1, unitPrice: fee, total: fee },
    ];
    const newLogisticsFee = current.robotLogisticsFee + fee;
    const subtotal = current.roomCharges + current.medicineCharges + newLogisticsFee;
    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    set((state) => ({
      bills: {
        ...state.bills,
        [bedNumber]: {
          ...current,
          robotLogisticsFee: newLogisticsFee,
          subtotal,
          tax,
          total,
          lineItems: newLineItems,
        },
      },
    }));
  },

  injectBedTurnaroundCharge: (bedNumber, orderNumber, items) => {
    const current = get().getBillForBed(bedNumber);
    const turnaroundFee = 150.0; // Bed Turnaround & Disinfection Charge
    const transitFee = 50.0; // Autonomous Transit Fee

    let additionalMedCost = 0;
    const newLines = [...current.lineItems];

    // 1. Add payload medicine lines
    items.forEach((item) => {
      const lineCost = item.quantity * item.unitPrice;
      additionalMedCost += lineCost;
      newLines.push({
        description: `${item.name} [Rx #${orderNumber}]`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: lineCost,
      });
    });

    // 2. Add Turnaround and Transit lines
    newLines.push({
      description: `Autonomous SG90 Hatch Delivery Fee [${orderNumber}]`,
      quantity: 1,
      unitPrice: transitFee,
      total: transitFee,
    });
    newLines.push({
      description: `Bed #${bedNumber} Rapid Turnaround & UV-C Disinfection`,
      quantity: 1,
      unitPrice: turnaroundFee,
      total: turnaroundFee,
    });

    const newMedTotal = current.medicineCharges + additionalMedCost;
    const newLogisticsTotal = current.robotLogisticsFee + transitFee + turnaroundFee;
    const subtotal = current.roomCharges + newMedTotal + newLogisticsTotal;
    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    set((state) => ({
      bills: {
        ...state.bills,
        [bedNumber]: {
          ...current,
          medicineCharges: newMedTotal,
          robotLogisticsFee: newLogisticsTotal,
          subtotal,
          tax,
          total,
          lineItems: newLines,
        },
      },
    }));
  },

  requestDischarge: (bedNumber, doctorName, clinicalSummary, doctorRole = 'Attending Physician') => {
    const bill = get().getBillForBed(bedNumber);
    const newReq: DischargeRequest = {
      id: `DCR-${Math.floor(1000 + Math.random() * 9000)}`,
      bedNumber,
      patientName: bill.patientName,
      doctorName,
      doctorRole,
      clinicalSummary,
      recommendedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_ADMIN_APPROVAL',
    };

    set((state) => ({
      dischargeRequests: [
        newReq,
        ...state.dischargeRequests.filter(
          (r) => !(r.bedNumber === bedNumber && r.status === 'PENDING_ADMIN_APPROVAL')
        ),
      ],
    }));

    return {
      success: true,
      message: `Clinical discharge recommendation for Bed ${bedNumber} submitted to Facility Administration.`,
      request: newReq,
    };
  },

  approveAndDischarge: (requestId, userRole, adminNotes = 'Discharge and billing settlement authorized by Administration.') => {
    if (userRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Access Denied: Only Facility Administrators can approve patient discharge and settle EMR billing.',
      };
    }

    const req = get().dischargeRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Discharge request not found.' };
    }

    // Release bed & settle bill
    set((state) => {
      const copyBills = { ...state.bills };
      delete copyBills[req.bedNumber];

      const updatedRequests = state.dischargeRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED' as const,
              adminNotes,
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      );

      return {
        bills: copyBills,
        dischargeRequests: updatedRequests,
      };
    });

    return {
      success: true,
      message: `Bed ${req.bedNumber} patient discharge finalized. Inpatient bill settled and bed marked ready for UV-C turnaround.`,
    };
  },

  rejectDischarge: (requestId, userRole, reason) => {
    if (userRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Access Denied: Only Facility Administrators can review discharge requests.',
      };
    }

    set((state) => ({
      dischargeRequests: state.dischargeRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED' as const,
              adminNotes: reason,
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    }));

    return {
      success: true,
      message: 'Discharge request declined and returned to attending clinical staff.',
    };
  },

  dischargeAndSettle: (bedNumber, userRole) => {
    if (userRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Access Denied: Only Facility Administrators can finalize patient discharge. Attending Physicians can only submit discharge requests.',
      };
    }

    set((state) => {
      const copy = { ...state.bills };
      delete copy[bedNumber];

      const updatedReqs = state.dischargeRequests.map((r) =>
        r.bedNumber === bedNumber && r.status === 'PENDING_ADMIN_APPROVAL'
          ? {
              ...r,
              status: 'APPROVED' as const,
              adminNotes: 'Direct admin authorization',
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      );

      return { bills: copy, dischargeRequests: updatedReqs };
    });

    return {
      success: true,
      message: `Bed ${bedNumber} discharge authorized and settled in hospital EMR.`,
    };
  },
}));
