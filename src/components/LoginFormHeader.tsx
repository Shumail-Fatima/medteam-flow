import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import { Healing } from '@mui/icons-material';

const LoginFormHeader: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Avatar
        sx={{
          bgcolor: theme.palette.primary.main,
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2,
        }}
      >
        <Healing sx={{ fontSize: 32 }} />
      </Avatar>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sign In
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Enter your credentials to access the dashboard
      </Typography>
    </Box>
  );
};

export default LoginFormHeader;