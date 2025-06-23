import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const AdminTaskManagement: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Task Management
        </Typography>
        <Typography variant="body1">
          This is the admin task management page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminTaskManagement;