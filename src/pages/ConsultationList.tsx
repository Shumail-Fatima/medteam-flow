import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, TextField, Avatar } from '@mui/material';
import { ArrowForward, CalendarToday, Schedule } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import { useAuth } from '../context/AuthContext';
import type { AppDispatch, RootState } from '../store/Store';
import type { Consultation } from '../types/medical';
import PageHeader from '../components/sharedComponents/PageHeader';
import { SearchFilterbox } from '../components/SearchFilterbox';
import FilterBar from '../components/sharedComponents/FilterBar';
import { useDataFiltering } from '../hooks/useDataFiltering';
import { fetchPatients } from '../store/slices/PatientSlice';
import { fetchConsultations } from '../store/slices/MedicalSlice';
import { string } from 'yup';

const ConsultationList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = searchParams.get('patientId');
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const patients = useSelector((state: RootState) => state.patients.patients);
  const [searchFilter, setSearchFilter] = useState('');



  // 🔑 Fetch required data on first load
  useEffect(() => {
    dispatch(fetchPatients());
     dispatch(fetchConsultations()); // if needed
  }, [dispatch]);

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

  const { filters, filteredData: filteredConsultations
    , updateFilter, clearFilters } = useDataFiltering({
      data: doctorConsultations.map((consultation) => {
        // Attach patientName so the generic filter can use it
        const patient = patients.find((p) => p.id === consultation.patientId);
        return {
          ...consultation,
          patientName: patient?.name || ''
        };
      }),
      searchFields: ['patientName'], // ✅ hook handles search
      filterConfig: {
        dateField: 'createdAt',
      }
  });

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

    //const [searchFilter, setSearchFilter] = useState('');
    // const filteredConsultations = doctorConsultations.filter((consultation) => {
    //   const patient = patients.find((p) => p.id === consultation.patientId);
    //   return patient ? patient.name.toLowerCase().includes(searchFilter.toLowerCase()) : false;
    // })

  const pageTitle = patientId
    ? `Consultation Records for ${patients.find((p) => p.id === patientId)?.name || 'Patient'}`
    : 'Consultation Records';

  
    const filterFields = [
      {
        key: 'search',
        label: 'Search',
        type: 'search' as const,
        placeholder: 'Search patients...',
      },
      {
        key: 'date',
        label: 'Consultation Date',
        type: 'date' as const,
        startIcon: <Schedule />
      },
    ];
  

  return (
    <Layout>
      <Box sx={{ borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      
      <PageHeader
        title={pageTitle}
      />
      {/* <SearchFilterbox value={searchFilter} onChange={setSearchFilter}/> */}
      </Box>
      <FilterBar
        filters={filterFields}
        values={filters as Record<string, string>}
        onFilterChange={(key, value) => updateFilter(key as keyof typeof filters, value)}
        onClearFilters={clearFilters}
        sx={{mb: 2, flex: 1, mr: 2}}
      />

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