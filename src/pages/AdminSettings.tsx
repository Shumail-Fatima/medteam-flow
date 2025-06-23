import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const AdminSettings: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1">
          This is the admin settings page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminSettings;