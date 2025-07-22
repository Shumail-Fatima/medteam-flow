import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {AddButton} from '../components/CustomButton';
import { Add, CalendarToday, } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/sharedComponents/Layout';
import CustomTabs, { type TabOption } from '../components/GeneralizedTabs';
import DataTable from '../components/sharedComponents/DataTable';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { RootState, AppDispatch } from '../store/Store';
import { addPatient } from '../store/slices/PatientSlice';
import type { PatientFormData } from '../types/appointment';
import type { Consultation } from '../types/medical';
import { addConsultation, updateConsultation } from '../store/slices/MedicalSlice';
import usersData from '../data/Users.json';
import doctorSlots from '../data/DoctorSlots.json';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import doctorSpecialtiesData from '../data/DoctorSpeciality.json';
import ConsultationManagement from './Consultation';
import { useLocation, useNavigate } from 'react-router-dom';

// Prepare doctors array from users data
const doctors = usersData
  .filter((user: any) => user.roleId === 2)
  .map((user: any) => {
    const slotObj = doctorSlots.find((s: any) => String(s.doctorId) === String(user.id));
    const specialty = doctorSpecialtiesData.find((spec: any) => spec.id === user.specialtyId);
    return {
      label: user.name,
      value: String(user.id),
      availableSlots: slotObj ? slotObj.slots : [],
      specialtyId: user.specialtyId,
      specialtyName: specialty?.name || 'General Medicine',
    };
  });

const tabOptions: TabOption[] = [
  { label: 'Consultations List' },
  { label: 'Create Consultation' },
];

const tabRoutes = ['/consultations', '/consultations/new'];

const ConsultMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = tabRoutes.indexOf(location.pathname);

  // Redux state and dispatch setup
  const dispatch = useDispatch<AppDispatch>();
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const patients = useSelector((state: RootState) => state.patients.patients);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Tab change handler
  const handleTabChange = (_: any, newValue: number) => {
    navigate(tabRoutes[newValue]);
    if (newValue === 1) {
      // Reset selected appointment when switching to create tab
      setSelectedConsultation(null);
    }
  };

  // Create new appointment button handler
  const handleCreateConsultation = () => {
    setSelectedConsultation(null);
    setActiveTab(1); // Switch to create appointment tab
  };

  // View appointment details
  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setViewDialogOpen(true);
    // For now, just show a snackbar. You can implement a view modal if needed
    setSnackbar({
      open: true,
      message: `Viewing consultation for ${consultation.patientName}`,
      severity: 'success'
    });
  };

  // Edit appointment handler
  const handleEditConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setActiveTab(1); // Switch to create/edit tab
  };

  // Delete appointment handler
  const handleDeleteConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDeleteDialogOpen(true);
  };



  // Handle appointment form submission (create or update)
  const handleConsultationSubmit = (data: Consultation) => {
    const selectedPatient = patients.find(p => p.id === data.patientId);
    const selectedDoctor = doctors.find(d => d.value === data.doctorId);

    if (!selectedPatient || !selectedDoctor) {
      setSnackbar({
        open: true,
        message: 'Invalid patient or doctor selection',
        severity: 'error'
      });
      return;
    }

    if (selectedConsultation) {
      // Update existing appointment using Redux action
      const updatedConsultation: Consultation = {
        ...selectedConsultation,
        doctorId: data.doctorId,
        doctorName: selectedDoctor.label,
        status: selectedConsultation.status,
      };
      dispatch(updateConsultation(updatedConsultation));
      setSnackbar({
        open: true,
        message: 'Appointment updated successfully!',
        severity: 'success'
      });
    } else {
      // Create new appointment using Redux action
      const newConsultation: Consultation = {
        id: `apt_${Date.now()}`,
        patientId: data.patientId,
        patientName: selectedPatient.name,
        doctorId: data.doctorId,
        doctorName: selectedDoctor.label,
        date: data.date,
        createdAt: new Date().toISOString(),
        status: 'pending',
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        notes: data.notes,
        prescriptions: data.prescriptions,
        followUpRequired: data.followUpRequired,
      };
      dispatch(addConsultation(newConsultation));
      setSnackbar({
        open: true,
        message: 'Appointment created successfully!',
        severity: 'success'
      });
    }

    // Switch back to appointments list tab
    setActiveTab(0);
    setSelectedConsultation(null);
  };

  // Handle new patient registration from appointment form
  const handleAddPatient = (patientData: PatientFormData) => {
    const newPatient = {
      id: `patient_${Date.now()}`,
      ...patientData,
    };
    
    // Dispatch Redux action to add new patient
    dispatch(addPatient(newPatient));
    setSnackbar({
      open: true,
      message: 'Patient registered successfully!',
      severity: 'success'
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Appointment Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Schedule and manage patient appointments with healthcare professionals
        </Typography>
      </Box>

      {/* Tabs for switching between list and create views */}
      <CustomTabs value={currentTab} onChange={handleTabChange} tabs={tabOptions} />

      {/* Appointments List Tab */}
      {currentTab === 0 && (
        <Box>
          {/* Create Appointment Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              All Appointments
            </Typography>
            <AddButton
            onClick={handleCreateConsultation}
            label='Create New Appointment'
            startIcon= {<Add />}
            ></AddButton>
          </Box>

          {/* Appointments Table */}
          <DataTable<Consultation>
            data={consultations}
            columns={[
              {
                header: 'Patient',
                render: (consultation) => (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {consultation.patientName}
                    </Typography>
                    <Chip
                      label={`Age: ${consultation.patientName}`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )
              },
              {
                header: 'Doctor',
                render: (consultation) => (
                  <Typography variant="body2">
                    {consultation.doctorName}
                  </Typography>
                )
              },
              {
                header: 'Appointment Date',
                render: (consultation) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                    <Typography variant="body2">
                      {formatDate(consultation.date)}
                    </Typography>
                  </Box>
                )
              },
              {
                header: 'Created',
                render: (consultation) => (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(consultation.createdAt)}
                  </Typography>
                )
              },
            ]}
            onView={handleViewConsultation}
            onEdit={handleEditConsultation}
            onDelete={handleDeleteConsultation}
            showEdit={() => true}
            showDelete={() => true}
            emptyMessage="No consultations available"
          />
        </Box>
      )}

      {/* Create/Edit Appointment Tab */}

      {/* View User Dialog */}

      {/* Delete Confirmation Dialog */}

      {/* Success/Error Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Layout>
  );
};

export default ConsultMain;