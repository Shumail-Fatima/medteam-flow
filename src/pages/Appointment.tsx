import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/sharedComponents/Layout';

const Appointment: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Appointment
        </Typography>
        <Typography variant="body1">
          This is the Appointment page.
        </Typography>
      </Box>
    </Layout>
  );
};

export default Appointment;