import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const AdminReports: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1">
          This is the admin reports page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminReports;