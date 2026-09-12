import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types';

export interface RolePermissions {
  // Clinical & Prescribing
  canPrescribe: boolean;
  canOrderDelivery: boolean;
  canSuggestDrug: boolean;
  canViewClinicalHistory: boolean;

  // Bedside & Hardware
  canUnlockHatch: boolean;
  canDispatchRobot: boolean;
  canOverrideSafety: boolean;
  canControlLift: boolean;
  canViewTelemetry: boolean;

  // Hospital & Admin
  canManageBeds: boolean;
  canProvisionStaff: boolean;
  canCompileBilling: boolean;
  canViewAllPatients: boolean;

  // Pharmacy & Inventory (Strict Role Isolation)
  canEditInventory: boolean;
  canRestock: boolean;
  canApproveDrugRequests: boolean;
  canViewLowStock: boolean;

  // Emergency & Calling
  canTriggerCallingMatrix: boolean;
  canResolveAlerts: boolean;
}

export function useRole() {
  const { currentUser, loginAsPersona } = useAuthStore();
  const role: UserRole = currentUser?.role || 'PATIENT';

  const isPatient = role === 'PATIENT';
  const isDoctor = role === 'DOCTOR';
  const isNurse = role === 'NURSE';
  const isChemist = role === 'CHEMIST';
  const isAdmin = role === 'ADMIN';

  const permissions: RolePermissions = {
    // Clinical & Prescribing
    canPrescribe: isDoctor,
    canOrderDelivery: isDoctor || isNurse,
    canSuggestDrug: isDoctor,
    canViewClinicalHistory: isDoctor || isNurse || isAdmin,

    // Bedside & Hardware
    canUnlockHatch: isNurse || isChemist || isAdmin,
    canDispatchRobot: isChemist || isAdmin,
    canOverrideSafety: isAdmin,
    canControlLift: isAdmin,
    canViewTelemetry: isDoctor || isNurse || isChemist || isAdmin,

    // Hospital & Admin
    canManageBeds: isAdmin,
    canProvisionStaff: isAdmin,
    canCompileBilling: isAdmin,
    canViewAllPatients: isDoctor || isNurse || isChemist || isAdmin,

    // Pharmacy & Inventory (Strict Chemist Ownership)
    canEditInventory: isChemist || isAdmin,
    canRestock: isChemist,
    canApproveDrugRequests: isChemist || isAdmin,
    canViewLowStock: isChemist || isAdmin || isDoctor,

    // Emergency & Calling
    canTriggerCallingMatrix: isPatient || isNurse,
    canResolveAlerts: isDoctor || isNurse || isAdmin,
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(role);
  };

  return {
    role,
    currentUser,
    isPatient,
    isDoctor,
    isNurse,
    isChemist,
    isAdmin,
    permissions,
    hasAccess,
    switchPersona: loginAsPersona,
  };
}
