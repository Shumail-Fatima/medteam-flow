import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Avatar,
} from '@mui/material';
import { Add, AdminPanelSettings, LocalHospital, People } from '@mui/icons-material';
import { AddButton } from '../components/CustomButton';
import Layout from '../components/sharedComponents/Layout';
import UserFormModal from '../components/formModals/UserFormModal';
import type { User, UserFormData } from '../types/Auth';
import roleData from '../../mockServer/data/Roles.json';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { addUserAsync, updateUserAsync, deleteUserAsync, fetchUsers } from '../store/slices/UserSlice';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';
import { useAuth } from '../context/AuthContext';
import { useCrudOperations } from '../hooks/useCrudOperations';
import { usePermissions } from '../hooks/usePermissions';
import { useDataFiltering } from '../hooks/useDataFiltering';
import StatusChip from '../components/sharedComponents/StatusChip';
import FilterBar from '../components/sharedComponents/FilterBar';
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from '../components/sharedComponents/ActionButtons';

const AdminUserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const users = useSelector((state: RootState) => state.user.users);

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);

  // Hooks
  const { permissions } = usePermissions();
  const { snackbar, closeSnackbar, handleAdd, handleUpdate, handleDelete } = useCrudOperations({
    onAdd: async (user: User) => {
      await dispatch(addUserAsync(user)).unwrap();
      const notification = NotificationService.createUserNotification(
        currentUser?.id || '',
        currentUser?.id || '',
        user.name,
        'created'
      );
      sendNotification(notification);
    },
    onUpdate: async (user: User) => {
      await dispatch(updateUserAsync(user)).unwrap();
      const notification = NotificationService.createUserNotification(
        currentUser?.id || '',
        currentUser?.id || '',
        user.name,
        'updated'
      );
      sendNotification(notification);
    },
    onDelete: async (item: User | string) => {
      const user = typeof item === 'string' ? users.find(u => u.id === item) : item;
      if (user) {
        await dispatch(deleteUserAsync(user)).unwrap();
        const notification = NotificationService.createUserNotification(
          currentUser?.id || '',
          currentUser?.id || '',
          user.name,
          'deleted'
        );
        sendNotification(notification);
      }
    },
    successMessages: {
      add: 'User created successfully!',
      update: 'User updated successfully!',
      delete: 'User deleted successfully!',
    },
  });

  const { filters, filteredData, updateFilter, clearFilters } = useDataFiltering({
    data: users,
    searchFields: ['name', 'email', 'username'],
    filterConfig: {
      roleField: 'roleName',
    },
  });

  // Effects
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Helper functions
  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1: return 'error';
      case 2: return 'primary';
      case 3: return 'secondary';
      default: return 'default';
    }
  };

  const getRoleIcon = (roleId: number) => {
    switch (roleId) {
      case 1: return <AdminPanelSettings />;
      case 2: return <LocalHospital />;
      case 3: return <People />;
      default: return <People />;
    }
  };

  // Event handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setUserToView(user);
    setViewDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleUserSubmit = async (data: UserFormData) => {
    const roleName = roleData.Roles.find(role => role.id === String(data.roleId))?.name || 'unknown';
    
    if (selectedUser) {
      const updatedUser: User = {
        ...selectedUser,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        roleName,
        specialtyId: data.specialtyId,
      };
      await handleUpdate(updatedUser);
    } else {
      const newUser: User = {
        id: `apt_${Date.now()}`,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        createdAt: new Date().toISOString(),
        roleName,
        specialtyId: data.specialtyId,
      };
      await handleAdd(newUser);
    }
    
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await handleDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter configuration
  const filterFields = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search users...',
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'doctor', label: 'Doctor' },
        { value: 'nurse', label: 'Nurse' },
      ],
    },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      header: 'User',
      render: (u: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: `${getRoleColor(u.roleId)}.main` }}>
            {u.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name}</Typography>
        </Box>
      ),
    },
    { 
      header: 'Username', 
      render: (u: User) => <Typography variant="body2">{u.username}</Typography> 
    },
    { 
      header: 'Email', 
      render: (u: User) => <Typography variant="body2">{u.email}</Typography> 
    },
    {
      header: 'Role',
      render: (u: User) => (
        <StatusChip 
          status={u.roleName} 
          customConfigs={{
            admin: {
              label: 'ADMIN',
              color: 'error',
              icon: <AdminPanelSettings />,
            },
            doctor: {
              label: 'DOCTOR',
              color: 'primary',
              icon: <LocalHospital />,
            },
            nurse: {
              label: 'NURSE',
              color: 'secondary',
              icon: <People />,
            },
          }}
        />
      ),
    },
    { 
      header: 'Created', 
      render: (u: User) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(u.createdAt)}
        </Typography>
      ) 
    },
    {
      header: 'Actions',
      render: (u: User) => {
        const canEdit = u.roleName !== 'admin';
        const canDelete = u.roleName !== 'admin';
        
        const actions = [
          createViewAction(() => handleViewUser(u)),
          createEditAction(() => handleEditUser(u), !canEdit),
          createDeleteAction(() => handleDeleteUser(u), !canDelete),
        ];

        return <ActionButtons actions={actions} />;
      },
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          User Management
        </Typography>
      </Box>

      {/* Action Button and Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FilterBar
          filters={filterFields}
          values={filters as Record<string, string>}
          onFilterChange={(key: string, value: string) => updateFilter(key as keyof typeof filters, value)}
          onClearFilters={clearFilters}
          sx={{ mb: 0, flex: 1, mr: 2 }}
        />
        <AddButton
          onClick={handleAddUser}
          label='Add New User'
          startIcon={<Add />}
        />
      </Box>

      {/* Users Table */}
      <DataTable<User>
        data={filteredData}
        sortByDate={(u) => u.createdAt}
        columns={tableColumns}
        // onView={handleViewUser}
        // onEdit={handleEditUser}
        // onDelete={handleDeleteUser}
        // showEdit={(u) => u.roleName !== 'admin'}
        // showDelete={(u) => u.roleName !== 'admin'}
        emptyMessage="No users found"
      />

      {/* Add/Edit User Modal */}
      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUserSubmit}
        user={selectedUser}
      />

      {/* View User Dialog */}
      <ViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        title="User Details"
        avatar={
          userToView && (
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mr: 3,
                bgcolor: getRoleColor(userToView.roleId) + '.main',
                fontSize: '1.5rem'
              }}
            >
              {userToView.name.charAt(0).toUpperCase()}
            </Avatar>
          )
        }
        chip={
          userToView && (
            <StatusChip 
              status={userToView.roleName}
              customConfigs={{
                admin: {
                  label: 'ADMIN',
                  color: 'error',
                  icon: <AdminPanelSettings />,
                },
                doctor: {
                  label: 'DOCTOR',
                  color: 'primary',
                  icon: <LocalHospital />,
                },
                nurse: {
                  label: 'NURSE',
                  color: 'secondary',
                  icon: <People />,
                },
              }}
            />
          )
        }
        fields={
          userToView
            ? [
                { label: 'Username', value: userToView.username },
                { label: 'Email Address', value: userToView.email },
                { label: 'User ID', value: userToView.id },
                { label: 'Account Created', value: formatDate(userToView.createdAt) },
              ]
            : []
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        itemName={userToDelete?.name || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Success/Error Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={closeSnackbar}
      />
    </Layout>
  );
};

export default AdminUserManagement;