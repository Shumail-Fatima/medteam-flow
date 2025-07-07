import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/sharedComponents/Layout';

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Default dashboard
        </Typography>
        <Typography variant="body1">
          This is the Default dashboard page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default DashboardPage;

