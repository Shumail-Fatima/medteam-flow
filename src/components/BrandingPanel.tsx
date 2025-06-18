import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalHospital,
  Security,
} from '@mui/icons-material';

const BrandingPanel: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        padding: 4,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 30% 70%, ${alpha('#ffffff', 0.1)} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: alpha('#ffffff', 0.2),
              mr: 2,
              width: 56,
              height: 56,
            }}
          >
            <LocalHospital sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              MedCare Pro
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Healthcare Management System
            </Typography>
          </Box>
        </Box>

                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Welcome Back
                </Typography>
              </Box>
            </Box>
          );
        };

export default BrandingPanel;