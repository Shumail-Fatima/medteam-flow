import React, { useState, useMemo } from 'react';
import {
  Box,Typography,Chip,Avatar,TextField,MenuItem,FormControl,
  InputLabel,Select,
} from '@mui/material';
import { Add, People, AdminPanelSettings, LocalHospital, } from '@mui/icons-material';
import {AddButton} from '../components/CustomButton';
import Layout from '../components/sharedComponents/Layout';
import UserFormModal from '../components//formModals/UserFormModal';
import type { User, UserFormData } from '../types/Auth';
import rolesData from '../data/Roles.json';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { addUser, updateUser, deleteUser } from '../store/slices/UserSlice';

const AdminUserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.user.users);
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

  // Filter states
  const [roleFilter, setRoleFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

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

  // Filtered users based on search criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === '' || 
        user.roleName.toLowerCase() === roleFilter.toLowerCase();
      const matchesSearch = searchFilter === '' || 
        user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(searchFilter.toLowerCase());
      
      return  matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchFilter]);
  
  //create new user button handler
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  //edit user button handler
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  //view user button handler
  const handleViewUser = (user: User) => {
    setUserToView(user);
    setViewDialogOpen(true);
  };

  //delete user button handler
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Handle user form submission (create or update)
  const handleUserSubmit = (data:UserFormData) => {
    const roleName = rolesData.find(role => role.id === data.roleId)?.name || 'unknown';
    if (selectedUser) {
      // Update existing user using Redux action
      const updatedUser: User = {
        ...selectedUser,
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        roleName,
      };
      dispatch(updateUser(updatedUser));
      setSnackbar({
        open: true,
        message: 'User updated successfully!',
        severity: 'success'
      });
  } else {
    // Create new user using Redux action
    const newUser: User ={
      id: `apt_${Date.now()}`,
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      roleId: data.roleId,
      createdAt: new Date().toISOString(),
      roleName,
    };
    dispatch(addUser(newUser));
    setSnackbar({
      open: true,
      message: 'User created successfully!',
      severity: 'success'
    })
  }
  //close form modal
    setIsModalOpen(false);
    setSelectedUser(null);
}

  // Confirm delete user
  const confirmDelete = () => {
    if (userToDelete){
      // Dispatch Redux action to delete user
      dispatch(deleteUser(userToDelete.id));
      setSnackbar({
        open: true,
        message: 'User deleted successfully!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }

  // Format date for display
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
          All Users ({filteredUsers.length})
        </Typography>
        <AddButton
        onClick={handleAddUser} 
        label='Add New User'
        startIcon= {<Add />}
        ></AddButton>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{  display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <TextField
            label="Filter by Name or Email"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            size="small"
            placeholder="Enter name to search..."
            sx={{ minWidth: 200, width: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 200, width: 250 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Users Table in adminusermanagement*/}
      <DataTable<User>
        data={filteredUsers}
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
        emptyMessage="No users found"
      />


      {/* Add/Edit User Modal */}
      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        //onSubmit={handleFormSubmit}
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