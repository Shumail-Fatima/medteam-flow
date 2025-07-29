import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Link,
  Divider,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
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
import { useAuth } from '../context/AuthContext';
import BrandingPanel from '../components/BrandingPanel';
import LoginFormHeader from '../components/LoginFormHeader';
import { useNavigate } from 'react-router-dom';
const LoginFormPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

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
    const success = await login(data.email, data.password);  // ✅ await here
      setIsLoading(false);
      if (success ) {
        // Redirect or show success
        console.log('Login successful');
        // You can redirect to the dashboard or show a success message here
        // below in comment are checks if the user is doctor/admin/nurse so they will be directed to thier relevant pages accordingly
        // For example, using React Router:
        if (user?.roleId === 1){
          navigate('/admin/user-management'); 
        } else if (user?.roleId === 2){
          navigate('/doc/dashboard'); 
        }
      } else {
        // Show error
        console.error('Login failed');
      }
    };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 1000,
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box sx={{ display: 'flex', minHeight: 500 }}>
          <BrandingPanel />

          {/* Right Login Form */}
          <Box sx={{ flex: 1, padding: 4 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <LoginFormHeader />
              {/* The login form itself */}
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
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginFormPage;