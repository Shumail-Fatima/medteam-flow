import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const AdminSupport: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Support
        </Typography>
        <Typography variant="body1">
          This is the admin support page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default AdminSupport;