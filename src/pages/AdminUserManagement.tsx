import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Snackbar,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  People,
  AdminPanelSettings,
  LocalHospital,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import UserFormModal from '../components/UserFormModal';
import type { User, UserFormData } from '../types/Auth';
import rolesData from '../data/Roles.json';
import usersData from '../data/Users.json';

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

  const getStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.roleId === 1).length;
    const doctorCount = users.filter(u => u.roleId === 2).length;
    const nurseCount = users.filter(u => u.roleId === 3).length;

    return { totalUsers, adminCount, doctorCount, nurseCount };
  };

  const stats = getStats();

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

      {/* Users Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  User
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Username
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Role
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Created
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.roleId) + '.main' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.roleId)}
                      label={user.roleName.toUpperCase()}
                      color={getRoleColor(user.roleId)}
                      size="small"
                      sx={{ fontWeight: 'bold', minWidth: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        onClick={() => handleViewUser(user)}
                        color="info"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'info.light', color: 'white' } }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleEditUser(user)}
                        color="primary"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteUser(user)}
                        color="error"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            User Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {userToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {userToView.name}
                  </Typography>
                  <Chip
                    icon={getRoleIcon(userToView.roleId)}
                    label={userToView.roleName.toUpperCase()}
                    color={getRoleColor(userToView.roleId)}
                    size="small"
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Username
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {userToView.username}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {userToView.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {userToView.id}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Account Created
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(userToView.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="error">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>"{userToDelete?.name}"</strong>? 
            This action cannot be undone and will permanently remove their access to the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default AdminUserManagement;