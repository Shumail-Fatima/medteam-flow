import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Link,
  Divider,
  Typography,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import type { LoginFormData } from '../types/Auth';
import { loginValidationSchema } from '../validation/AuthValidation';
import ControlledTextField from '../components/ControlledTextField';
import ControlledCheckbox from '../components/ControlledCheckbox';
import SubmitButton from '../components/SubmitButton';

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginValidationSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', data);
      // Here you would typically handle the login logic
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      <ControlledTextField
        name="email"
        control={control}
        label="Email Address"
        type="email"
        error={errors.email}
        startIcon={<Email color="action" />}
      />

      <ControlledTextField
        name="password"
        control={control}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        error={errors.password}
        startIcon={<Lock color="action" />}
        endIcon={showPassword ? <VisibilityOff /> : <Visibility />}
        onEndIconClick={togglePasswordVisibility}
        endIconAriaLabel="toggle password visibility"
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <ControlledCheckbox
          name="rememberMe"
          control={control}
          label="Remember me"
        />
        <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </Box>

      <SubmitButton isLoading={isLoading}>
        Sign In to Dashboard
      </SubmitButton>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact your system administrator
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;