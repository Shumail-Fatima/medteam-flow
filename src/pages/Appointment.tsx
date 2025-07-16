import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Badge,
  Stack ,
  Button,
} from '@mui/material';
import {AddButton} from '../components/CustomButton';
import { Add, CalendarToday, } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/sharedComponents/Layout';
import CustomTabs, { type TabOption } from '../components/GeneralizedTabs';
import DataTable from '../components/sharedComponents/DataTable';
import AppointmentForm from '../components/formModals/AppointmentForm';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { RootState, AppDispatch } from '../store/Store';
import { addAppointment, updateAppointment, deleteAppointment } from '../store/slices/AppointmentSlice';
import { addPatient } from '../store/slices/PatientSlice';
import type { Appointment, AppointmentFormData, PatientFormData } from '../types/appointment';
import usersData from '../data/Users.json';
import doctorSlots from '../data/DoctorSlots.json';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import doctorSpecialtiesData from '../data/DoctorSpeciality.json';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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





const AppointmentManagement: React.FC = () => {
  // Redux state and dispatch setup
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  //const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const allAppointments = useSelector((state: RootState) => state.appointments.appointments);
  const appointments = user && user.roleName === 'doctor'
    ? allAppointments.filter((a) => a.doctorId === user.id)
    : allAppointments;
  const patients = useSelector((state: RootState) => state.patients.patients);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'previous'>('all');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const tabOptions: TabOption[] = user && user.roleName === 'doctor'
? [{ label: 'Appointments List' }]
: [
  { label: 'Appointments List' },
  { label: 'Create Appointment' },
];

  // Tab change handler
  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // Reset selected appointment when switching to create tab
      setSelectedAppointment(null);
    }
  };

  //filter appointments based on the filter state (date)
  const now = new Date();

  const filteredAppointments = appointments.filter((appointment) => {
    const slotDate = new Date(appointment.appointmentSlot);
    if (filter === 'today') {
      return (
        slotDate.getFullYear() === now.getFullYear() &&
        slotDate.getMonth() === now.getMonth() &&
        slotDate.getDate() === now.getDate()
      );
    }
    if (filter === 'upcoming') {
      // After today
      return slotDate > now && (
        slotDate.getFullYear() !== now.getFullYear() ||
        slotDate.getMonth() !== now.getMonth() ||
        slotDate.getDate() !== now.getDate()
      );
    }
    if (filter === 'previous') {
      // Before today
      return (
        slotDate < now &&
        (
          slotDate.getFullYear() !== now.getFullYear() ||
          slotDate.getMonth() !== now.getMonth() ||
          slotDate.getDate() !== now.getDate()
        )
      );
    }
    return true; // 'all'
  });


  // Create new appointment button handler
  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setActiveTab(1); // Switch to create appointment tab
  };

  // View appointment details
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
    // For now, just show a snackbar. You can implement a view modal if needed
    setSnackbar({
      open: true,
      message: `Viewing appointment for ${appointment.patientName}`,
      severity: 'success'
    });
  };

  // Edit appointment handler
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setActiveTab(1); // Switch to create/edit tab
  };

  // Delete appointment handler
  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  // Confirm delete appointment
  const confirmDelete = () => {
    if (appointmentToDelete) {
      // Dispatch Redux action to delete appointment
      dispatch(deleteAppointment(appointmentToDelete.id));
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Handle appointment form submission (create or update)
  const handleAppointmentSubmit = (data: AppointmentFormData) => {
    const selectedPatient = patients.find(p => p.id === data.patientId);
    const selectedDoctor = doctors.find(d => d.value === data.doctorId);
    const selectedSpecialty = doctorSpecialtiesData.find(s => s.id === selectedDoctor?.specialtyId);

    if (!selectedPatient || !selectedDoctor) {
      setSnackbar({
        open: true,
        message: 'Invalid patient or doctor selection',
        severity: 'error'
      });
      return;
    }

    if (selectedAppointment) {
      // Update existing appointment using Redux action
      const updatedAppointment: Appointment = {
        ...selectedAppointment,
        specialtyName: selectedSpecialty?.name,
        doctorId: data.doctorId,
        doctorName: selectedDoctor.label,
        appointmentSlot: data.appointmentSlot,
        reason: data.reason,
        status: selectedAppointment.status,
      };
      dispatch(updateAppointment(updatedAppointment));
      setSnackbar({
        open: true,
        message: 'Appointment updated successfully!',
        severity: 'success'
      });
    } else {
      // Create new appointment using Redux action
      const newAppointment: Appointment = {
        id: `apt_${Date.now()}`,
        patientId: data.patientId,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age || 0,
        specialtyName: selectedSpecialty?.name,
        doctorId: data.doctorId,
        doctorName: selectedDoctor.label,
        appointmentSlot: data.appointmentSlot,
        reason: data.reason,
        createdAt: new Date().toISOString(),
        status: 'scheduled',
        consultationCompleted: false,
      };
      dispatch(addAppointment(newAppointment));
      setSnackbar({
        open: true,
        message: 'Appointment created successfully!',
        severity: 'success'
      });
    }

    // Switch back to appointments list tab
    setActiveTab(0);
    setSelectedAppointment(null);
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
      <CustomTabs value={activeTab} onChange={handleTabChange} tabs={tabOptions} />

      {/* Appointments List Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Create Appointment Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              All Appointments
            </Typography>
            {user?.roleName !== 'doctor' && (
            <AddButton
            onClick={handleCreateAppointment}
            label='Create New Appointment'
            startIcon= {<Add />}
            ></AddButton>
            )}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Badge color={filter === 'all' ? 'primary' : 'default'}>
              <Chip
                label="All"
                color={filter === 'all' ? 'primary' : 'default'}
                onClick={() => setFilter('all')}
                clickable
              />
            </Badge>
            <Badge color={filter === 'today' ? 'primary' : 'default'}>
              <Chip
                label="Today"
                color={filter === 'today' ? 'primary' : 'default'}
                onClick={() => setFilter('today')}
                clickable
              />
            </Badge>
            <Badge color={filter === 'upcoming' ? 'primary' : 'default'}>
              <Chip
                label="Upcoming"
                color={filter === 'upcoming' ? 'primary' : 'default'}
                onClick={() => setFilter('upcoming')}
                clickable
              />
            </Badge>
            <Badge color={filter === 'previous' ? 'primary' : 'default'}>
              <Chip
                label="Previous"
                color={filter === 'previous' ? 'primary' : 'default'}
                onClick={() => setFilter('previous')}
                clickable
              />
            </Badge>
          </Stack>

          {/* Appointments Table */}
          <DataTable<Appointment>
            data={filteredAppointments}
            columns={[
              {
                header: 'Patient',
                render: (appointment) => (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {appointment.patientName}
                    </Typography>
                    <Chip
                      label={`Age: ${appointment.patientAge}`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )
              },
              {
                header: 'Doctor',
                render: (appointment) => (
                  <Typography variant="body2">
                    {appointment.doctorName}
                  </Typography>
                )
              },
              {
                header: 'Appointment Date',
                render: (appointment) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                    <Typography variant="body2">
                      {formatDate(appointment.appointmentSlot)}
                    </Typography>
                  </Box>
                )
              },
              {
                header: 'Created',
                render: (appointment) => (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(appointment.createdAt)}
                  </Typography>
                )
              },
              {
                header: 'Actions',
                render: (appointment) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user?.roleName === 'doctor' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/consultation?appointmentId=${appointment.id}&patientId=${appointment.patientId}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        {appointment.consultationCompleted ? 'View' : 'Start'}
                      </Button>
                    )}
                  </Box>
                )
              },
            ]}
            onView={handleViewAppointment}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            showEdit={() => user?.roleName !== 'doctor'}
            showDelete={() => true}
          />
        </Box>
      )}

      {/* Create/Edit Appointment Tab */}
      {activeTab === 1 && user?.roleName !== 'doctor' &&(
        <AppointmentForm
          onSubmit={handleAppointmentSubmit}
          doctors={doctors}
          initialValues={selectedAppointment ? {
            patientId: selectedAppointment.patientId,
            doctorId: selectedAppointment.doctorId,
            appointmentSlot: selectedAppointment.appointmentSlot,
            reason: selectedAppointment.reason,
          } : {}}
          mode={selectedAppointment ? 'edit' : 'create'}
          onAddPatient={handleAddPatient}
        />
      )}

      {/* View User Dialog */}
      <ViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        title="Appointment Details"
        fields={
          selectedAppointment
            ? [
                { label: 'Patient name', value: selectedAppointment.patientName },
                { label: 'Patient age', value: selectedAppointment.patientAge },
                { label: 'Doctor', value: selectedAppointment.doctorName },
                { label: 'Doctor specialty', value: selectedAppointment.specialtyName },
                { label: 'Appointment slot', value: formatDate(selectedAppointment.appointmentSlot)},
                { label: 'Created at', value: formatDate(selectedAppointment.createdAt)},
                { label: 'Reason', value: selectedAppointment.reason}
              ]
            : []
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        itemName={appointmentToDelete?.patientName || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for "${appointmentToDelete?.patientName}"? This action cannot be undone.`}
      />

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

export default AppointmentManagement;