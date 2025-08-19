import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Button, Menu, MenuItem, IconButton, TextField, } from '@mui/material';
import {AddButton} from '../components/CustomButton';
import { Add, CalendarToday, MoreVert } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/sharedComponents/Layout';
import CustomTabs, { type TabOption } from '../components/GeneralizedTabs';
import DataTable from '../components/sharedComponents/DataTable';
import AppointmentForm from '../components/formModals/AppointmentForm';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { RootState, AppDispatch } from '../store/Store';
import { fetchAppointments, addAppointmentAsync, updateAppointmentAsync, deleteAppointmentAsync } from '../store/slices/AppointmentSlice';
import type { Appointment, AppointmentFormData } from '../types/appointment';
import type { PatientFormData } from '../types/medical';
import usersData from '../../mockServer/MockData.json';
import doctorSlots from '../../mockServer/MockData.json';
import ViewDialog from '../components/sharedComponents/ViewDialog';
//import doctorSpecialtiesData from '../../mockServer/data/DoctorSpeciality.json';
import doctorSpecialtiesData from '../../mockServer/MockData.json';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../store/slices/PatientSlice';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';
import PageHeader from '../components/sharedComponents/PageHeader';
import { useDoctors } from '../hooks/useDoctors';
import { useFilteredAppointments } from '../hooks/useFilteredAppoint';
import { formatDate, slotDate } from '../utils/DateUtils';
import { AppointmentFilterChips } from '../components/AppointStatFilterBadge';

// Prepare doctors array from users data
const doctors = usersData.Users
  .filter((user: any) => user.roleId === 2)
  .map((user: any) => {
    const slotObj = doctorSlots.DoctorsSlots.find((s: any) => String(s.doctorId) === String(user.id));
    const specialty = doctorSpecialtiesData.DoctorSpecialties.find((spec: any) => spec.id === user.specialtyId);
    // Use the correct data source that matches the specialtyId format
    //const specialty = doctorSpecialtiesData.find((spec: any) => spec.id === user.specialtyId);
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

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);
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
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointmentForStatus, setSelectedAppointmentForStatus] = useState<Appointment | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const tabOptions: TabOption[] = user && user.roleName === 'doctor'
? [{ label: 'Appointments List' }]
: [
  { label: 'Appointments List' },
  { label: 'Create Appointment' },
];

  const { sendNotification } = useNotification();
  

  // Tab change handler
  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // Reset selected appointment when switching to create tab
      setSelectedAppointment(null);
    }
  };

  //filter appointments based on the filter state (date)
  //const now = new Date();
  const filteredAppointments = useFilteredAppointments(appointments, patients, filter, searchFilter);

  // const filteredAppointments = appointments.filter((appointment) => {
  //   const slotDate = new Date(appointment.appointmentSlot);
  //   if (filter === 'upcoming') {
  //     // Upcoming: scheduled and date >= today
  //     return (
  //       appointment.status === 'scheduled' &&
  //       (
  //         slotDate > now ||
  //         (
  //           slotDate.getFullYear() === now.getFullYear() &&
  //           slotDate.getMonth() === now.getMonth() &&
  //           slotDate.getDate() === now.getDate()
  //         )
  //       )
  //     );
  //   }
  //   if (filter === 'previous') {
  //     // Before today
  //     return (
  //       appointment.status === 'completed' ||(
  //       slotDate < now &&
  //       (
  //         slotDate.getFullYear() !== now.getFullYear() ||
  //         slotDate.getMonth() !== now.getMonth() ||
  //         slotDate.getDate() !== now.getDate()
  //       )
  //       )
  //     );
  //   }

  //   const patient = patients.find((p) => p.id === appointment.patientId);
  //   return patient ? patient.name.toLowerCase().includes(searchFilter.toLowerCase()) : false;
  //   //return true; // 'all'
  // });

  
  // In your appointment creation logic/component

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
      // dispatch(deleteAppointment(appointmentToDelete.id));
      dispatch(deleteAppointmentAsync(appointmentToDelete.id));
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Handle status change
  const handleStatusChange = (appointment: Appointment, newStatus: "scheduled" | "completed" | "cancelled" | "no-show") => {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: newStatus,
    };
    
    dispatch(updateAppointmentAsync(updatedAppointment));
    
    let receiveId: string;
    if (user?.roleId === 1){
      receiveId = appointment.doctorId;
    }else{
      receiveId = appointment.createdById || "";
    }
    
    
    if (newStatus === 'cancelled') {
      const notification = NotificationService.createAppointmentNotification(
        receiveId,
        user?.id || '',
        appointment.patientId,
        appointment.patientName,
        appointment.doctorName,
        appointment.appointmentSlot,
        'cancelled'
      );
      sendNotification(notification);
    } else if (newStatus === 'no-show') {
      // For completed status, use 'updated' notification type
      const notification = NotificationService.createAppointmentNotification(
        receiveId,
        user?.id || '',
        appointment.patientId,
        appointment.patientName,
        appointment.doctorName,
        appointment.appointmentSlot,
        'updated'
      );
      sendNotification(notification);
    }
    
    setSnackbar({
      open: true,
      message: `Appointment status changed to ${newStatus} successfully!`,
      severity: 'success'
    });
    
    // Close the status menu
    setStatusMenuAnchor(null);
    setSelectedAppointmentForStatus(null);
  };

  // Handle status menu open
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedAppointmentForStatus(appointment);
  };

  // Handle status menu close
  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedAppointmentForStatus(null);
  };

    // Fetch appointments from API on component mount
    useEffect(() => {
    dispatch(fetchAppointments()); // Load appointments from backend on mount
  }, [dispatch]);

  // Handle appointment form submission (create or update)
  const handleAppointmentSubmit = (data: AppointmentFormData) => {
    const selectedPatient = patients.find(p => p.id === data.patientId);
    const selectedDoctor = doctors.find(d => d.value === data.doctorId);
    //const selectedSpecialty = doctorSpecialtiesData.find((s: any) => s.id === selectedDoctor?.specialtyId);
    const selectedSpecialty = doctorSpecialtiesData.DoctorSpecialties.find(s => s.id === selectedDoctor?.specialtyId);

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
        status: data.status, // Use the status from form data instead of existing status
      };
      // dispatch(updateAppointment(updatedAppointment));
      dispatch(updateAppointmentAsync(updatedAppointment));
      setSnackbar({
        open: true,
        message: 'Appointment updated successfully!',
        severity: 'success'
      });

      if (data.status == 'cancelled'){
        const notification = NotificationService.createAppointmentNotification(
          selectedAppointment.doctorId,
          user?.id || '',
          //newAppointment.id,
          selectedAppointment.patientId,
          selectedAppointment.patientName,
          selectedAppointment.doctorName,
          selectedAppointment.appointmentSlot,
          'cancelled'
        );
        // Send notification to the doctor
      sendNotification(notification);
      }
      else{
        const notification = NotificationService.createAppointmentNotification(
          selectedAppointment.doctorId,
          user?.id || '',
          //newAppointment.id,
          selectedAppointment.patientId,
          selectedAppointment.patientName,
          selectedAppointment.doctorName,
          selectedAppointment.appointmentSlot,
          'updated'
        );
        // Send notification to the doctor
      sendNotification(notification);
      }
      

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
        createdById: user?.id,
        appointmentSlot: data.appointmentSlot,
        reason: data.reason,
        createdAt: new Date().toISOString(),
        status: data.status,
        consultationCompleted: false,
      };
             // dispatch(addAppointment(newAppointment));
       dispatch(addAppointmentAsync(newAppointment));
       setSnackbar({
         open: true,
         message: 'Appointment created successfully!',
         severity: 'success'
       });
       
       // Send notification to the doctor
       const notification = NotificationService.createAppointmentNotification(
         newAppointment.doctorId,
         user?.id || '',
         //newAppointment.id,
         newAppointment.patientId,
         newAppointment.patientName,
         newAppointment.doctorName,
         newAppointment.appointmentSlot,
         'created'
       );
       sendNotification(notification);
    }
    // Switch back to appointments list tab
    setActiveTab(0);
    setSelectedAppointment(null);
  };

  const appointmentNotification = (appointment: Appointment) => {
    const notification = NotificationService.createConsultationNotification(
      appointment.doctorId,
         user?.id || '',
         appointment.id,
         appointment.patientName,
         'started'
    );
    sendNotification(notification);
    navigate(`/consultation?appointmentId=${appointment.id}&patientId=${appointment.patientId}`)
  }

  // Patient registration is handled within AppointmentForm; no-op here
  const handleAddPatient = () => {};

  const pageTitle = searchFilter
    ? `Appointments for ${patients.find((p) => p.id === searchFilter)?.name || 'Patient'}`
    : 'Appointments';

  return (
    <Layout>
      <Box sx={{ borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Appointment Management
        </Typography> */}
        <PageHeader title={pageTitle} />
        <TextField
        label="Search by Patient Name"
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        size="small"
        placeholder="Enter name to search..."
        sx={{ minWidth: 200, width: 250 }}
      />
      </Box>

      {/* Tabs for switching between list and create views */}
      {user?.roleName !== 'doctor' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <CustomTabs value={activeTab} onChange={handleTabChange} tabs={tabOptions} />
            <AddButton
            onClick={handleCreateAppointment}
            label='Create New Appointment'
            startIcon= {<Add />}
            ></AddButton></Box>
      )}

      {/* Appointments List Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Create Appointment Button */}
          <AppointmentFilterChips filter={filter as any} onChange={setFilter as any} />

          {/* Appointments Table */}
          <DataTable<Appointment>
            data={filteredAppointments}
            sortByDate={(a) => a.appointmentSlot}
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
                header: 'Status',
                render: (appointment) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'scheduled': return 'primary';
                      case 'completed': return 'success';
                      case 'cancelled': return 'error';
                      case 'no-show': return 'warning';
                      default: return 'default';
                    }
                  };
                  
                  if (slotDate(appointment) == true || user?.roleName === 'admin'){
                    return(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )
                  } else if (slotDate(appointment) == false){
                    return(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => appointmentNotification(appointment)}
                          sx={{ textTransform: 'none' }}
                        >
                          Start
                        </Button>
                        
                      </Box>
                    )}
                }
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
                header: '',
                render: (appointment) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                            size="small"
                            onClick={(e) => handleStatusMenuOpen(e, appointment)}
                            sx={{ p: 0.5 }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                  </Box>
                )
              },
            ]}
            onView={handleViewAppointment}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            showEdit={() => user?.roleName !== 'doctor'}
            showDelete={() => true}
            emptyMessage="No appointments found"
          />
        </Box>
      )}

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => selectedAppointmentForStatus && handleStatusChange(selectedAppointmentForStatus, 'cancelled')}
          disabled={selectedAppointmentForStatus?.status === 'cancelled'}
        >
          Mark as Cancelled
        </MenuItem>
        <MenuItem 
          onClick={() => selectedAppointmentForStatus && handleStatusChange(selectedAppointmentForStatus, 'no-show')}
          disabled={selectedAppointmentForStatus?.status === 'no-show'}
        >
          Mark as No-Show
        </MenuItem>
      </Menu>

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
            status: selectedAppointment.status, // Include status in initial values
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
                { label: 'Status', value: selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)},
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