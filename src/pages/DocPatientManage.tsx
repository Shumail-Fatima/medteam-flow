import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  ContactEmergency,
  Bloodtype,
  Warning,
  LocalHospital,
  Medication,
  Assignment,
  Close,
  Timeline,
  CalendarToday,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import FilterBar from '../components/sharedComponents/FilterBar';
import { useDataFiltering } from '../hooks/useDataFiltering';
import type { RootState, AppDispatch } from '../store/Store';
import type { ExtendedPatient, MedicalHistoryEntry } from '../types/medical';
import { useAuth } from '../context/AuthContext';
import PatientDetails from './PatientDetails';
import PageHeader from '../components/sharedComponents/PageHeader';
import { fetchPatients } from '../store/slices/PatientSlice';
import { fetchAppointments } from '../store/slices/AppointmentSlice';
import { fetchConsultations } from '../store/slices/MedicalSlice';

const DoctorPatientManagement: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  // Redux state - Get extended patients with medical history
  //const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const patients = useSelector((state: RootState) => state.patients.patients);
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const appointments = useSelector((state: RootState) => state.appointments.appointments);

    // 🔑 Fetch required data on first load
    useEffect(() => {
      dispatch(fetchPatients());
      dispatch(fetchAppointments());
       dispatch(fetchConsultations()); // if needed
    }, [dispatch]);

  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);
  //const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] = useState(false);

  // Filter patients that have had consultations or appointments with current doctor
  const doctorPatients = useMemo(() => {
    const doctorConsultations = consultations.filter(cons => cons.doctorId === user?.id);
    const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
    const consultationPatientIds = [...new Set(doctorConsultations.map(cons => cons.patientId))];
    const appointmentPatientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
    const allPatientIds = [...new Set([...consultationPatientIds, ...appointmentPatientIds])];
    return patients.filter(patient => allPatientIds.includes(patient.id));
  }, [patients, consultations, appointments, user?.id]);

  // If a patientId is present in the URL, render the details page
  if (patientId) {
    return <PatientDetails />;
  }

  // Get patient's appointments with current doctor
  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => 
      apt.patientId === patientId && apt.doctorId === user?.id
    );
  };

  // Get patient's consultations with current doctor
  const getPatientConsultations = (patientId: string) => {
    return consultations.filter(cons => 
      cons.patientId === patientId && cons.doctorId === user?.id
    );
  };

  const handleViewPatient = (patient: ExtendedPatient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleViewMedicalHistory = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);
    setMedicalHistoryDialogOpen(true);
  };

  const handleStartConsultation = (patient: ExtendedPatient) => {
    navigate(`/consultation?patientId=${patient.id}`);
  };

  const handleBackToPatients = () => {
    navigate('/patients');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getHistoryTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <LocalHospital color="error" />;
      case 'prescription': return <Medication color="primary" />;
      case 'consultation': return <Assignment color="info" />;
      case 'procedure': return <LocalHospital color="warning" />;
      default: return <Assignment />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'error';
      case 'prescription': return 'primary';
      case 'consultation': return 'info';
      case 'procedure': return 'warning';
      default: return 'default';
    }
  };

  // Main patients list view
  return (
    <Layout>
      <PageHeader
        title="Patient Management"
        // subtitle="View and manage your patients' medical records and consultation history"
      />

      {/* Patients Table */}
      <DataTable<ExtendedPatient>
        data={doctorPatients}
        columns={[
          {
            header: 'Patient',
            render: (patient) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {patient.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Age: {calculateAge(patient.dateOfBirth)}
                  </Typography>
                </Box>
              </Box>
            )
          },
            {
    header: 'Date of Birth',
    render: (patient) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
        <Typography variant="body2">
          {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          day: 'numeric',
        })}
      </Typography>
      </Box>
    )
  },
          {
            header: 'Last Consultation',
            render: (patient) => {
              const lastConsultation = getPatientConsultations(patient.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              return lastConsultation ? (
                <Box>
                  <Typography variant="body2">
                    {formatDate(lastConsultation.date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastConsultation.diagnosis}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No consultations
                </Typography>
              );
            }
          },
        ]}
        onView={handleViewPatient}
        onEdit={() => {}} // Doctors can't edit patient basic info
        onDelete={() => {}} // Doctors can't delete patients
        showEdit={() => false}
        showDelete={() => false}
        emptyMessage="No patients found"
      />

      {/* Medical History Timeline Dialog */}
      <Dialog 
        open={medicalHistoryDialogOpen} 
        onClose={() => setMedicalHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6" fontWeight="bold">
            Medical Timeline - {selectedPatient?.name}
          </Typography>
          <IconButton onClick={() => setMedicalHistoryDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setMedicalHistoryDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default DoctorPatientManagement;