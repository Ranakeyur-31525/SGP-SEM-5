import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';

export interface PersonaDemo {
  label: string;
  role: UserRole;
  profile: UserProfile;
}

export const PRESET_PERSONAS: PersonaDemo[] = [
  {
    label: 'Doctor (STAT MD)',
    role: 'DOCTOR',
    profile: {
      id: 'usr_doc_01',
      name: 'Dr. Anita Mehta, MD',
      email: 'doc@hospital.com',
      role: 'DOCTOR',
      dutyShift: 'Day',
      department: 'Critical Care & ICU',
      isActive: true,
    },
  },
  {
    label: 'Nurse (Staff Station)',
    role: 'NURSE',
    profile: {
      id: 'usr_nur_01',
      name: 'Sarah Joseph, RN',
      email: 'nurse@hospital.com',
      role: 'NURSE',
      dutyShift: 'Day',
      department: 'Floor 3 Station (Wards 21-30)',
      isActive: true,
    },
  },
  {
    label: 'Chemist (Pharmacy)',
    role: 'CHEMIST',
    profile: {
      id: 'usr_chm_01',
      name: 'Rahul Verma (R.Ph)',
      email: 'chemist@hospital.com',
      role: 'CHEMIST',
      department: 'Central Drug Dispensary & Formulary',
      isActive: true,
    },
  },
  {
    label: 'Patient (Bed 12)',
    role: 'PATIENT',
    profile: {
      id: 'usr_pat_12',
      name: 'Ramesh Sharma',
      email: 'bed12@hospital.com',
      role: 'PATIENT',
      assignedBed: 12,
      allocatedFloor: 2,
      department: 'Cardiology Ward Floor 2',
      isActive: true,
    },
  },
  {
    label: 'Admin (Hospital Ops)',
    role: 'ADMIN',
    profile: {
      id: 'usr_adm_01',
      name: 'Vikram Patel (Lead Admin)',
      email: 'admin@hospital.com',
      role: 'ADMIN',
      department: 'Biomedical & 50-Bed Fleet Ops',
      isActive: true,
    },
  },
];

interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  userAccounts: UserProfile[];
  loginAsPersona: (role: UserRole) => void;
  loginWithCredentials: (email: string, role?: UserRole) => void;
  logout: () => void;
  addUserAccount: (user: Omit<UserProfile, 'id'>) => void;
  toggleUserStatus: (id: string) => void;
  updateUserBed: (id: string, bedNumber: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: PRESET_PERSONAS[0].profile, // Default to Doctor
  isAuthenticated: true,
  userAccounts: [
    ...PRESET_PERSONAS.map((p) => p.profile),
    {
      id: 'usr_doc_02',
      name: 'Dr. Sandeep Rao',
      email: 'sandeep.rao@hospital.com',
      role: 'DOCTOR',
      department: 'Neurology',
      isActive: true,
    },
    {
      id: 'usr_nur_02',
      name: 'Priyanka Das, RN',
      email: 'priyanka.nurse@hospital.com',
      role: 'NURSE',
      department: 'Floor 4 Post-Op',
      isActive: true,
    },
  ],

  loginAsPersona: (role: UserRole) => {
    const found = PRESET_PERSONAS.find((p) => p.role === role);
    if (found) {
      set({ currentUser: found.profile, isAuthenticated: true });
    }
  },

  loginWithCredentials: (email: string, role?: UserRole) => {
    // Check if matching preset persona email
    const match = PRESET_PERSONAS.find(
      (p) => p.profile.email.toLowerCase() === email.toLowerCase()
    );
    if (match) {
      set({ currentUser: match.profile, isAuthenticated: true });
      return;
    }

    // Otherwise create session with requested or inferred role
    const resolvedRole: UserRole =
      role ||
      (email.includes('doc')
        ? 'DOCTOR'
        : email.includes('nurse')
        ? 'NURSE'
        : email.includes('chemist')
        ? 'CHEMIST'
        : email.includes('bed') || email.includes('pat')
        ? 'PATIENT'
        : 'ADMIN');

    set({
      currentUser: {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: resolvedRole,
        assignedBed: resolvedRole === 'PATIENT' ? 12 : undefined,
        allocatedFloor: resolvedRole === 'PATIENT' ? 2 : undefined,
        department: resolvedRole === 'PATIENT' ? 'Ward Floor 2' : 'Hospital Operations',
        isActive: true,
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  addUserAccount: (user) => {
    set((state) => ({
      userAccounts: [
        ...state.userAccounts,
        { ...user, id: `usr_${Date.now().toString(36)}` },
      ],
    }));
  },

  toggleUserStatus: (id) => {
    set((state) => ({
      userAccounts: state.userAccounts.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive } : u
      ),
    }));
  },

  updateUserBed: (id, bedNumber) => {
    set((state) => ({
      userAccounts: state.userAccounts.map((u) =>
        u.id === id ? { ...u, assignedBed: bedNumber } : u
      ),
    }));
  },
}));
