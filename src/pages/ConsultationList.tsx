import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton, Chip, TextField } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import { useAuth } from '../context/AuthContext';
import type { RootState } from '../store/Store';
import type { Consultation } from '../types/medical';

const ConsultationList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const patients = useSelector((state: RootState) => state.medical.extendedPatients);

  // Only show completed consultations for the logged-in doctor
  const doctorConsultations = useMemo(
    () =>
      consultations.filter(
        (c) =>
          c.doctorId === user?.id &&
          c.status === 'completed' &&
          (!patientId || c.patientId === patientId)
      ),
    [consultations, user?.id, patientId]
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

    const [searchFilter, setSearchFilter] = useState('');
    const filteredConsultations = doctorConsultations.filter((consultation) => {
      const patient = patients.find((p) => p.id === consultation.patientId);
      return patient ? patient.name.toLowerCase().includes(searchFilter.toLowerCase()) : false;
    })

  const pageTitle = patientId
    ? `Consultation Records for ${patients.find((p) => p.id === patientId)?.name || 'Patient'}`
    : 'Consultation Records';

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your completed consultations
        </Typography>
      </Box>

      <Box sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{  display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <TextField
        label="Search by Patient Name"
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        size="small"
        placeholder="Enter name to search..."
        sx={{ minWidth: 200, width: 250 }}
      />
      </Box>
      </Box>
      <DataTable<Consultation>
        data={filteredConsultations}
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