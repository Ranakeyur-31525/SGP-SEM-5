from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request, 'user_role', 'ADMIN')
        return role == 'ADMIN'

class IsDoctorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request, 'user_role', 'ADMIN')
        return role in ['DOCTOR', 'ADMIN']

class IsChemistOrAdmin(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request, 'user_role', 'ADMIN')
        return role in ['CHEMIST', 'ADMIN']

class IsStaffMember(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request, 'user_role', 'ADMIN')
        return role in ['DOCTOR', 'NURSE', 'CHEMIST', 'ADMIN']

class IsDoctorOrNurse(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request, 'user_role', 'ADMIN')
        return role in ['DOCTOR', 'NURSE', 'ADMIN']
