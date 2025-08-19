import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton, TextField, Avatar } from '@mui/material';
import { ArrowForward, CalendarToday } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import { useAuth } from '../context/AuthContext';
import type { RootState } from '../store/Store';
import type { Consultation } from '../types/medical';
import PageHeader from '../components/sharedComponents/PageHeader';

const ConsultationList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  //const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const patients = useSelector((state: RootState) => state.patients.patients);

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
      <Box sx={{ borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      
      <PageHeader
        title={pageTitle}
      />

      
      <TextField
        label="Search by Patient Name"
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        size="small"
        placeholder="Enter name to search..."
        sx={{ minWidth: 200, width: 250 }}
      />
      </Box>
      

      <DataTable<Consultation>
        
        data={filteredConsultations}
        sortByDate={(c) => c.date}
        columns={[
          {
            header: 'Patient Name',
            render: (consultation) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {consultation.patientName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {consultation.patientName}
                </Typography>
              </Box>
            ),
          },
          {
            header: 'Patient Birth Date',
            render: (consultation) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {getPatientBirthDate(consultation.patientId)}
                </Typography>
              </Box>
            ),
          },
          {
            header: 'Contact',
            render: (consultation) => (
              <Box>
                <Typography variant="body2">{patients.find((p) => p.id === consultation.patientId)?.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {patients.find((p) => p.id === consultation.patientId)?.phone}
                </Typography>
              </Box>
            )
          },
          {
            header: 'Consultation Date',
            render: (consultation) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {formatDate(consultation.date)}
                </Typography>
              </Box>
            ),
          },
          {
            header: 'Actions',
            render: (consultation) => (
              <IconButton
                onClick={() => navigate(`/consultation/view/${consultation.id}`)}
                color="primary"
              >
                <ArrowForward />
              </IconButton>
            ),
          },
        ]}
        showEdit={() => false}
        showDelete={() => false}
        emptyMessage="No consultations"
      />
    </Layout>
  );
};

export default ConsultationList;