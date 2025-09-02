import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export interface PermissionConfig {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canReassign?: boolean;
}

export const usePermissions = (userRole?: string) => {
  const { user } = useAuth();
  const currentUserRole = userRole || user?.roleName;

  const permissions = useMemo(() => {
    switch (currentUserRole) {
      case 'admin':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canView: true,
          canReassign: true,
        };
      case 'doctor':
        return {
          canCreate: false,
          canEdit: true,
          canDelete: false,
          canView: true,
          canReassign: true,
        };
      case 'nurse':
        return {
          canCreate: false,
          canEdit: true,
          canDelete: false,
          canView: true,
          canReassign: false,
        };
      default:
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canView: false,
          canReassign: false,
        };
    }
  }, [currentUserRole]);

  const canEditItem = useMemo(() => {
    return (item: any, field?: string) => {
      if (currentUserRole === 'admin') return true;
      if (currentUserRole === 'doctor') return true;
      if (currentUserRole === 'nurse') {
        // Nurses can only edit items assigned to them
        if (field === 'assigneeId') return item.assigneeId === user?.id;
        if (field === 'createdBy') return item.createdBy === user?.id;
        return item.assigneeId === user?.id;
      }
      return false;
    };
  }, [currentUserRole, user?.id]);

  const canDeleteItem = useMemo(() => {
    return (item: any) => {
      if (currentUserRole === 'admin') return true;
      if (currentUserRole === 'doctor') return true;
      return false;
    };
  }, [currentUserRole]);

  const canReassignItem = useMemo(() => {
    return (item: any) => {
      if (currentUserRole === 'admin') return true;
      if (currentUserRole === 'doctor') return true;
      return false;
    };
  }, [currentUserRole]);

  return {
    permissions,
    canEditItem,
    canDeleteItem,
    canReassignItem,
    userRole: currentUserRole,
    userId: user?.id,
  };
};
