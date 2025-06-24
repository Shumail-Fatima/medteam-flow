import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { 
  Close,
  Person,
  Email,
  Lock,
  Badge,
  AdminPanelSettings,
  LocalHospital,
  People,
} from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import type { UserFormData } from '../types/Auth';
import type { User } from '../types/Auth';
import rolesData from '../data/Roles.json';

const userSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  roleId: yup.number().required('Role is required'),
});

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
  isLoading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      roleId: 2 as number, // Default to doctor
    },
  });

  const selectedRoleId = watch('roleId') ?? 2;
  const selectedRole = rolesData.find(role => role.id === selectedRoleId);

  const getRoleIcon = (roleId: number) => {
    switch (roleId) {
      case 1: return <AdminPanelSettings />;
      case 2: return <LocalHospital />;
      case 3: return <People />;
      default: return <People />;
    }
  };

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1: return 'error';
      case 2: return 'primary';
      case 3: return 'secondary';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        roleId: user.roleId,
      });
    } else {
      reset({
        name: '',
        username: '',
        email: '',
        password: '',
        roleId: 2,
      });
    }
  }, [user, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update user information and permissions' : 'Create a new healthcare professional account'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Role Preview */}
            {selectedRole && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{ bgcolor: getRoleColor(selectedRoleId) + '.main' }}>
                  {getRoleIcon(selectedRoleId)}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Selected Role
                  </Typography>
                  <Chip
                    icon={getRoleIcon(selectedRoleId)}
                    label={selectedRole.name.toUpperCase()}
                    color={getRoleColor(selectedRoleId)}
                    size="small"
                  />
                </Box>
              </Box>
            )}

            <TextField
              {...register('name')}
              label="Full Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                //startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ mr: 1, color: 'action.active' }} />
                    </InputAdornment>
                  ),
              }}
            />

            <TextField
              {...register('username')}
              label="Username"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
              InputProps={{
                //startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ mr: 1, color: 'action.active' }} />
                    </InputAdornment>
                  ),
              }}
            />

            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                //startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ mr: 1, color: 'action.active' }} />
                    </InputAdornment>
                  ),
              }}
            />

            <TextField
              {...register('password')}
              label="Password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message || 'Minimum 6 characters required'}
              InputProps={{
                //startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ mr: 1, color: 'action.active' }} />
                    </InputAdornment>
                  ),
              }}
            />

            <TextField
              {...register('roleId')}
              select
              label="Role"
              fullWidth
              error={!!errors.roleId}
              helperText={errors.roleId?.message || 'Select the user\'s role and permissions'}
            >
              {rolesData.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRoleIcon(role.id)}
                    <Typography>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
            }}
          >
            {isEdit ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormModal;