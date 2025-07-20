import React, { useMemo } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import { useAuth } from '../context/AuthContext';
import type { RootState } from '../store/Store';
import type { Consultation } from '../types/medical';

const ConsultationList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const patients = useSelector((state: RootState) => state.medical.extendedPatients);

  // Only show completed consultations for the logged-in doctor
  const doctorConsultations = useMemo(
    () =>
      consultations.filter(
        (c) => c.doctorId === user?.id && c.status === 'completed'
      ),
    [consultations, user?.id]
  );

  // Helper to get patient birth date
  const getPatientBirthDate = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.dateOfBirth : '';
  };

  // Helper to format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Consultation Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your completed consultations
        </Typography>
      </Box>
      <DataTable<Consultation>
        data={doctorConsultations}
        columns={[
          {
            header: 'Patient Name',
            render: (consultation) => (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {consultation.patientName}
              </Typography>
            ),
          },
          {
            header: 'Patient Birth Date',
            render: (consultation) => (
              <Typography variant="body2">
                {getPatientBirthDate(consultation.patientId)}
              </Typography>
            ),
          },
          {
            header: 'Consultation Date',
            render: (consultation) => (
              <Typography variant="body2">
                {formatDate(consultation.date)}
              </Typography>
            ),
          },
        ]}
        onView={(consultation) =>
          navigate(`/consultation/view/${consultation.id}`)
        }
        showEdit={() => false}
        showDelete={() => false}
      />
    </Layout>
  );
};

export default ConsultationList;