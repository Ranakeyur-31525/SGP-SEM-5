import { create } from 'zustand';
import { DrugItem, DrugApprovalRequest } from '../types';

interface InventoryState {
  inventory: DrugItem[];
  drugRequests: DrugApprovalRequest[];
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  dispenseDrug: (drugId: string, quantity: number) => boolean;
  restockDrug: (drugId: string, quantity: number) => void;
  addNewDrugSku: (drug: Omit<DrugItem, 'id'> & { id?: string }) => DrugItem;
  requestNewDrug: (params: {
    requested_by: string;
    drug_name: string;
    recommended_dosage: string;
    category?: any;
    justification: string;
  }) => DrugApprovalRequest;
  approveDrugRequest: (
    requestId: string,
    chemistName: string,
    skuCode?: string,
    initialStock?: number,
    pricePerUnit?: number
  ) => void;
  rejectDrugRequest: (requestId: string, chemistName: string, reason: string) => void;
  getLowStockItems: () => Array<{ drug: DrugItem; triggerReason: string }>;
  getCriticalStatItems: () => DrugItem[];
}

const MASTER_DRUGS: DrugItem[] = [
  {
    id: 'DRG-001',
    name: 'Adrenaline (Epinephrine) 1mg/mL',
    category: 'CRITICAL_CARE',
    dosage: '1mg/1mL Ampoule',
    quantity: 14,
    unit: 'ampoules',
    pricePerUnit: 145.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 20,
    isHighRisk: true,
  },
  {
    id: 'DRG-002',
    name: 'Atropine Sulfate 0.6mg/mL',
    category: 'CRITICAL_CARE',
    dosage: '0.6mg/mL Ampoule',
    quantity: 12,
    unit: 'ampoules',
    pricePerUnit: 85.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 15,
    isHighRisk: true,
  },
  {
    id: 'DRG-003',
    name: 'Meropenem 1g IV Infusion',
    category: 'ANTIBIOTIC',
    dosage: '1g Vial with Diluent',
    quantity: 45,
    unit: 'vials',
    pricePerUnit: 890.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 15,
    isHighRisk: false,
  },
  {
    id: 'DRG-004',
    name: 'Regular Human Insulin 100 IU/mL',
    category: 'CRITICAL_CARE',
    dosage: '10mL Vial (1000 IU)',
    quantity: 18,
    unit: 'vials',
    pricePerUnit: 340.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 25,
    isHighRisk: true,
  },
  {
    id: 'DRG-005',
    name: 'Normal Saline (0.9% NaCl)',
    category: 'IV_FLUID',
    dosage: '500 mL IV Infusion',
    quantity: 115,
    unit: 'bottles',
    pricePerUnit: 60.0,
    minThresholdPercent: 15,
    absoluteFloorUnits: 30,
    isHighRisk: false,
  },
  {
    id: 'DRG-006',
    name: 'Ringer Lactate (RL)',
    category: 'IV_FLUID',
    dosage: '500 mL IV Infusion',
    quantity: 84,
    unit: 'bottles',
    pricePerUnit: 65.0,
    minThresholdPercent: 15,
    absoluteFloorUnits: 25,
    isHighRisk: false,
  },
  {
    id: 'DRG-007',
    name: 'Morphine Sulfate 10mg/mL',
    category: 'ANALGESIC',
    dosage: '1mL Narcotic Ampoule',
    quantity: 9,
    unit: 'ampoules',
    pricePerUnit: 220.0,
    minThresholdPercent: 25,
    absoluteFloorUnits: 15,
    isHighRisk: true,
  },
  {
    id: 'DRG-008',
    name: 'Fentanyl Citrate 50mcg/mL',
    category: 'ANALGESIC',
    dosage: '2mL Ampoule',
    quantity: 28,
    unit: 'ampoules',
    pricePerUnit: 310.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 15,
    isHighRisk: true,
  },
  {
    id: 'DRG-009',
    name: 'Piperacillin + Tazobactam 4.5g',
    category: 'ANTIBIOTIC',
    dosage: '4.5g IV Vial',
    quantity: 62,
    unit: 'vials',
    pricePerUnit: 520.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 20,
    isHighRisk: false,
  },
  {
    id: 'DRG-010',
    name: 'Amiodarone 150mg/3mL',
    category: 'EMERGENCY_CARDIAC',
    dosage: '3mL Ampoule',
    quantity: 16,
    unit: 'ampoules',
    pricePerUnit: 215.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 20,
    isHighRisk: true,
  },
  {
    id: 'DRG-011',
    name: 'Dopamine Hydrochloride 200mg',
    category: 'EMERGENCY_CARDIAC',
    dosage: '5mL Ampoule',
    quantity: 35,
    unit: 'ampoules',
    pricePerUnit: 180.0,
    minThresholdPercent: 20,
    absoluteFloorUnits: 15,
    isHighRisk: true,
  },
  {
    id: 'DRG-012',
    name: 'Paracetamol IV 1000mg',
    category: 'ANALGESIC',
    dosage: '100mL IV Bottle',
    quantity: 140,
    unit: 'bottles',
    pricePerUnit: 110.0,
    minThresholdPercent: 15,
    absoluteFloorUnits: 25,
    isHighRisk: false,
  },
];

const INITIAL_REQUESTS: DrugApprovalRequest[] = [
  {
    id: 'REQ-501',
    requested_by: 'Dr. Anita Mehta, MD',
    requested_by_role: 'DOCTOR',
    drug_name: 'Dexamethasone Sodium Phosphate 4mg/mL',
    recommended_dosage: '4mg/mL IV/IM Injection (2mL Vial)',
    category: 'CRITICAL_CARE',
    justification: 'Severe anaphylaxis and acute post-op inflammatory crisis protocol.',
    status: 'PENDING',
    created_at: new Date(Date.now() - 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'REQ-502',
    requested_by: 'Dr. Sandeep Rao',
    requested_by_role: 'DOCTOR',
    drug_name: 'Levetiracetam 500mg IV Infusion',
    recommended_dosage: '500mg/5mL Ampoule',
    category: 'CRITICAL_CARE',
    justification: 'Acute status epilepticus management for Floor 4 neurology bed.',
    status: 'PENDING',
    created_at: new Date(Date.now() - 110 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: MASTER_DRUGS,
  drugRequests: INITIAL_REQUESTS,
  searchQuery: '',
  selectedCategory: 'ALL',

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),

  dispenseDrug: (drugId, quantity) => {
    const item = get().inventory.find((d) => d.id === drugId);
    if (!item || item.quantity < quantity) {
      return false;
    }
    set((state) => ({
      inventory: state.inventory.map((d) =>
        d.id === drugId ? { ...d, quantity: d.quantity - quantity } : d
      ),
    }));
    return true;
  },

  restockDrug: (drugId, quantity) => {
    set((state) => ({
      inventory: state.inventory.map((d) =>
        d.id === drugId ? { ...d, quantity: d.quantity + quantity } : d
      ),
    }));
  },

  addNewDrugSku: (drug) => {
    const newId = drug.id || `DRG-${String(get().inventory.length + 1).padStart(3, '0')}`;
    const newItem: DrugItem = {
      ...drug,
      id: newId,
    };
    set((state) => ({
      inventory: [newItem, ...state.inventory],
    }));
    return newItem;
  },

  requestNewDrug: ({ requested_by, drug_name, recommended_dosage, category, justification }) => {
    const newReq: DrugApprovalRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      requested_by,
      requested_by_role: 'DOCTOR',
      drug_name,
      recommended_dosage,
      category: category || 'CRITICAL_CARE',
      justification,
      status: 'PENDING',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      drugRequests: [newReq, ...state.drugRequests],
    }));

    return newReq;
  },

  approveDrugRequest: (requestId, chemistName, skuCode, initialStock = 20, pricePerUnit = 150) => {
    const req = get().drugRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Automatically create new catalog SKU entry
    const newSku = skuCode || `DRG-${String(get().inventory.length + 1).padStart(3, '0')}`;
    const newDrug: DrugItem = {
      id: newSku,
      name: req.drug_name,
      category: (req.category as any) || 'CRITICAL_CARE',
      dosage: req.recommended_dosage,
      quantity: initialStock,
      unit: 'vials',
      pricePerUnit: pricePerUnit,
      minThresholdPercent: 20,
      absoluteFloorUnits: 15,
      isHighRisk: req.category === 'CRITICAL_CARE' || req.category === 'EMERGENCY_CARDIAC',
    };

    set((state) => ({
      inventory: [newDrug, ...state.inventory],
      drugRequests: state.drugRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewed_by: chemistName,
              reviewed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    }));
  },

  rejectDrugRequest: (requestId, chemistName, reason) => {
    set((state) => ({
      drugRequests: state.drugRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewed_by: chemistName,
              rejection_reason: reason,
              reviewed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      ),
    }));
  },

  getLowStockItems: () => {
    const items = get().inventory;
    const results: Array<{ drug: DrugItem; triggerReason: string }> = [];

    items.forEach((drug) => {
      const isBelowAbsolute = drug.quantity <= drug.absoluteFloorUnits;
      const nominalCapacity = Math.max(drug.absoluteFloorUnits * 4, 100);
      const percentLeft = (drug.quantity / nominalCapacity) * 100;
      const isBelowPercent = percentLeft < drug.minThresholdPercent;

      if (isBelowAbsolute || isBelowPercent) {
        let reason = '';
        if (isBelowAbsolute && isBelowPercent) {
          reason = `Absolute Floor (${drug.quantity}/${drug.absoluteFloorUnits}) & <20% Capacity Alert`;
        } else if (isBelowAbsolute) {
          reason = `Absolute Floor Breach (<= ${drug.absoluteFloorUnits} ${drug.unit})`;
        } else {
          reason = `Percentage Reserve Depleted (<${drug.minThresholdPercent}%)`;
        }
        results.push({ drug, triggerReason: reason });
      }
    });

    return results;
  },

  getCriticalStatItems: () => {
    return get().inventory.filter((d) => d.isHighRisk || d.category === 'CRITICAL_CARE');
  },
}));
