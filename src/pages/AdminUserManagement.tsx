import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Add,
  People,
  AdminPanelSettings,
  LocalHospital,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import UserFormModal from '../components/UserFormModal';
import type { User, UserFormData } from '../types/Auth';
import rolesData from '../data/Roles.json';
import usersData from '../data/Users.json';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import ViewDialog from '../components/sharedComponents/ViewDialog';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(
    usersData.map((user: any) => ({
      ...user,
      id: String(user.id),
      username: user.username ?? '',
      roleName: user.roleName ?? (rolesData.find((role) => role.id === user.roleId)?.name || ''),
      createdAt: user.createdAt ?? new Date().toISOString(),
    }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

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

  /*
  this was in the original code where there was a 
  component that showed the amount of current users having an account and their 
  roles
  
  const getStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.roleId === 1).length;
    const doctorCount = users.filter(u => u.roleId === 2).length;
    const nurseCount = users.filter(u => u.roleId === 3).length;

    return { totalUsers, adminCount, doctorCount, nurseCount };
  };

  const stats = getStats(); */

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

  const handleFormSubmit = (data: UserFormData) => {
    const roleName = rolesData.find(role => role.id === data.roleId)?.name || 'unknown';
    
    if (selectedUser) {
      // Edit existing user
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...data, roleName }
          : user
      ));
      setSnackbar({ 
        open: true, 
        message: 'User updated successfully!', 
        severity: 'success' 
      });
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        ...data,
        roleName,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      setSnackbar({ 
        open: true, 
        message: 'User added successfully!', 
        severity: 'success' 
      });
    }
    
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setSnackbar({ 
        open: true, 
        message: 'User deleted successfully!', 
        severity: 'success' 
      });
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

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage healthcare professionals and their access permissions
        </Typography>
      </Box>
    

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          All Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
          sx={{ 
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Users Table in adminusermanagement*/}
      <DataTable<User>
        data={users}
        columns={[
          {
            header: 'User',
            render: (u) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: `${getRoleColor(u.roleId)}.main` }}>
                  {u.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name}</Typography>
              </Box>
            )
          },
          { header: 'Username', render: (u) => <Typography variant="body2">{u.username}</Typography> },
          { header: 'Email', render: (u) => <Typography variant="body2">{u.email}</Typography> },
          {
            header: 'Role',
            render: (u) => (
              <Chip
                icon={getRoleIcon(u.roleId)}
                label={u.roleName.toUpperCase()}
                color={getRoleColor(u.roleId)}
                size="small"
                sx={{ fontWeight: 'bold', minWidth: 100 }}
              />
            )
          },
          { header: 'Created', render: (u) => <Typography variant="body2" color="text.secondary">{formatDate(u.createdAt)}</Typography> },
        ]}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        showEdit={(u) => u.roleName !== 'admin'}
        showDelete={(u) => u.roleName !== 'admin'}
      />


      {/* Add/Edit User Modal */}
      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
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
            <Chip
              icon={getRoleIcon(userToView.roleId)}
              label={userToView.roleName.toUpperCase()}
              color={getRoleColor(userToView.roleId)}
              size="small"
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Layout>
  );
};

export default AdminUserManagement;