import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Chip, Button, Menu, MenuItem, IconButton,
} from '@mui/material';
import { Add, CalendarToday, MoreVert } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/sharedComponents/Layout';
import CustomTabs, { type TabOption } from '../components/GeneralizedTabs';
import DataTable from '../components/sharedComponents/DataTable';
import AppointmentForm from '../components/formModals/AppointmentForm';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import { AddButton } from '../components/CustomButton';
import { SearchFilterbox } from '../components/SearchFilterbox';
import { AppointmentFilterChips } from '../components/AppointStatFilterBadge';
import PageHeader from '../components/sharedComponents/PageHeader';
import ViewDialog from '../components/sharedComponents/ViewDialog';

import type { RootState, AppDispatch } from '../store/Store';
import { 
  fetchAppointments, 
  addAppointmentAsync, 
  updateAppointmentAsync, 
  deleteAppointmentAsync 
} from '../store/slices/AppointmentSlice';
import { fetchPatients } from '../store/slices/PatientSlice';

import type { Appointment, AppointmentFormData } from '../types/appointment';
import type { PatientFormData } from '../types/medical';

import usersData from '../../mockServer/MockData.json';
import doctorSlots from '../../mockServer/MockData.json';
import doctorSpecialtiesData from '../../mockServer/MockData.json';

import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';
import { useDoctors } from '../hooks/useDoctors';
import { useFilteredAppointments } from '../hooks/useFilteredAppoint';
import { formatDate, slotDate } from '../utils/DateUtils';

// Types
interface DoctorOption {
  label: string;
  value: string;
  availableSlots: string[];
  specialtyId?: string;
  specialtyName?: string;
  description?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";
type FilterType = 'all' | 'upcoming' | 'previous';

// Constants
const ROLE_IDS = {
  ADMIN: '1',
  DOCTOR: '2',
} as const;

const NOTIFICATION_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  CANCELLED: 'cancelled',
  REMINDER: 'reminder',
} as const;

// Prepare doctors array from users data
const prepareDoctors = (): DoctorOption[] => {
  return usersData.Users
    .filter((user: any) => user.roleId === 2)
    .map((user: any) => {
      const slotObj = doctorSlots.DoctorsSlots.find(
        (s: any) => String(s.doctorId) === String(user.id)
      );
      const specialty = doctorSpecialtiesData.DoctorSpecialties.find(
        (spec: any) => spec.id === user.specialtyId
      );
      
      return {
        label: user.name,
        value: String(user.id),
        availableSlots: slotObj ? slotObj.slots : [],
        specialtyId: user.specialtyId,
        specialtyName: specialty?.name || 'General Medicine',
      };
    });
};

const AppointmentManagement: React.FC = () => {
  // Hooks
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sendNotification } = useNotification();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success'
  });
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointmentForStatus, setSelectedAppointmentForStatus] = useState<Appointment | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Selectors
  const allAppointments = useSelector((state: RootState) => state.appointments.appointments);
  const patients = useSelector((state: RootState) => state.patients.patients);

  // Memoized values
  const doctors = useMemo(() => prepareDoctors(), []);
  
  const appointments = useMemo(() => {
    if (!user || user.roleName !== 'doctor') return allAppointments;
    return allAppointments.filter((a) => a.doctorId === user.id);
  }, [allAppointments, user]);

  const filteredAppointments = useFilteredAppointments(appointments, patients, filter, searchFilter);

  const tabOptions: TabOption[] = useMemo(() => {
    if (user?.roleName === 'doctor') {
      return [{ label: 'Appointments List' }];
    }
    return [
      { label: 'Appointments List' },
      { label: 'Create Appointment' },
    ];
  }, [user?.roleName]);

  const pageTitle = useMemo(() => {
    if (!searchFilter) return 'Appointments';
    const patient = patients.find((p) => p.id === searchFilter);
    return `Appointments for ${patient?.name || 'Patient'}`;
  }, [searchFilter, patients]);

  // Effects
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Callbacks
  const handleTabChange = useCallback((_: any, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      setSelectedAppointment(null);
    }
  }, []);

  const handleCreateAppointment = useCallback(() => {
    setSelectedAppointment(null);
    setActiveTab(1);
  }, []);

  const handleViewAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
    setSnackbar({
      open: true,
      message: `Viewing appointment for ${appointment.patientName}`,
      severity: 'success'
    });
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setActiveTab(1);
  }, []);

  const handleDeleteAppointment = useCallback((appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!appointmentToDelete) return;
    
    try {
      await dispatch(deleteAppointmentAsync(appointmentToDelete.id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete appointment',
        severity: 'error'
      });
    }
  }, [appointmentToDelete, dispatch]);

  const handleStatusChange = useCallback(async (
    appointment: Appointment, 
    newStatus: AppointmentStatus
  ) => {
    try {
      const updatedAppointment: Appointment = {
        ...appointment,
        status: newStatus,
      };
      
      await dispatch(updateAppointmentAsync(updatedAppointment)).unwrap();
      
      // Determine who should receive the notification
      const receiveId = String(user?.roleId) === ROLE_IDS.ADMIN 
        ? appointment.doctorId 
        : appointment.createdById || '';

      // Determine notification action
      const notificationAction = newStatus === 'cancelled' 
        ? NOTIFICATION_ACTIONS.CANCELLED 
        : NOTIFICATION_ACTIONS.UPDATED;

      // Create and send notification
      const notification = NotificationService.createAppointmentNotification(
        receiveId,
        user?.id || '',
        appointment.patientId,
        appointment.patientName,
        appointment.doctorName,
        appointment.appointmentSlot,
        notificationAction
      );
      sendNotification(notification);
      
      setSnackbar({
        open: true,
        message: `Appointment status changed to ${newStatus} successfully!`,
        severity: 'success'
      });
      
      // Close the status menu
      setStatusMenuAnchor(null);
      setSelectedAppointmentForStatus(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update appointment status',
        severity: 'error'
      });
    }
  }, [user, dispatch, sendNotification]);

  const handleStatusMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedAppointmentForStatus(appointment);
  }, []);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
    setSelectedAppointmentForStatus(null);
  }, []);

  const handleAppointmentSubmit = useCallback(async (data: AppointmentFormData) => {
    try {
      const selectedPatient = patients.find(p => p.id === data.patientId);
      const selectedDoctor = doctors.find(d => d.value === data.doctorId);
      const selectedSpecialty = doctorSpecialtiesData.DoctorSpecialties.find(
        s => s.id === selectedDoctor?.specialtyId
      );

      if (!selectedPatient || !selectedDoctor) {
        setSnackbar({
          open: true,
          message: 'Invalid patient or doctor selection',
          severity: 'error'
        });
        return;
      }

      if (selectedAppointment) {
        // Update existing appointment
        const updatedAppointment: Appointment = {
          ...selectedAppointment,
          specialtyName: selectedSpecialty?.name,
          doctorId: data.doctorId,
          doctorName: selectedDoctor.label,
          appointmentSlot: data.appointmentSlot,
          reason: data.reason,
          status: data.status,
        };

        await dispatch(updateAppointmentAsync(updatedAppointment)).unwrap();
        
        // Send notification
        const notificationAction = data.status === 'cancelled' 
          ? NOTIFICATION_ACTIONS.CANCELLED 
          : NOTIFICATION_ACTIONS.UPDATED;
          
        const notification = NotificationService.createAppointmentNotification(
          selectedAppointment.doctorId,
          user?.id || '',
          selectedAppointment.patientId,
          selectedAppointment.patientName,
          selectedAppointment.doctorName,
          selectedAppointment.appointmentSlot,
          notificationAction
        );
        sendNotification(notification);

        setSnackbar({
          open: true,
          message: 'Appointment updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new appointment
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

        await dispatch(addAppointmentAsync(newAppointment)).unwrap();
        
        // Send notification
        const notification = NotificationService.createAppointmentNotification(
          newAppointment.doctorId,
          user?.id || '',
          newAppointment.patientId,
          newAppointment.patientName,
          newAppointment.doctorName,
          newAppointment.appointmentSlot,
          NOTIFICATION_ACTIONS.CREATED
        );
        sendNotification(notification);

        setSnackbar({
          open: true,
          message: 'Appointment created successfully!',
          severity: 'success'
        });
      }

      // Switch back to appointments list tab
      setActiveTab(0);
      setSelectedAppointment(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save appointment',
        severity: 'error'
      });
    }
  }, [selectedAppointment, patients, doctors, user?.id, dispatch, sendNotification]);

  const handleStartConsultation = useCallback((appointment: Appointment) => {
    const notification = NotificationService.createConsultationNotification(
      appointment.doctorId,
      user?.id || '',
      appointment.id,
      appointment.patientName,
      'started'
    );
    sendNotification(notification);
    navigate(`/consultation?appointmentId=${appointment.id}&patientId=${appointment.patientId}`);
  }, [user?.id, sendNotification, navigate]);

  const handleAddPatient = useCallback(() => {
    // Patient registration is handled within AppointmentForm
  }, []);

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      header: 'Patient',
      render: (appointment: Appointment) => (
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
      render: (appointment: Appointment) => (
        <Typography variant="body2">
          {appointment.doctorName}
        </Typography>
      )
    },
    {
      header: 'Appointment Date',
      render: (appointment: Appointment) => (
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
      render: (appointment: Appointment) => {
        const getStatusColor = (status: string) => {
          const statusColors: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'default'> = {
            scheduled: 'primary',
            completed: 'success',
            cancelled: 'error',
            'no-show': 'warning',
          };
          return statusColors[status] || 'default';
        };
        
        const canChangeStatus = slotDate(appointment) || user?.roleName === 'admin';
        const isPastSlot = !slotDate(appointment);
        
        if (canChangeStatus) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                color={getStatusColor(appointment.status)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          );
        } else if (isPastSlot) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleStartConsultation(appointment)}
                sx={{ textTransform: 'none' }}
              >
                Start
              </Button>
            </Box>
          );
        }
        
        return null;
      }
    },
    {
      header: 'Created',
      render: (appointment: Appointment) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(appointment.createdAt)}
        </Typography>
      )
    },
    {
      header: '',
      render: (appointment: Appointment) => (
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
  ], [user?.roleName, handleStatusMenuOpen, handleStartConsultation]);

  // View dialog fields
  const viewDialogFields = useMemo(() => {
    if (!selectedAppointment) return [];
    
    return [
      { label: 'Patient name', value: selectedAppointment.patientName },
      { label: 'Patient age', value: selectedAppointment.patientAge },
      { label: 'Doctor', value: selectedAppointment.doctorName },
      { label: 'Doctor specialty', value: selectedAppointment.specialtyName },
      { label: 'Appointment slot', value: formatDate(selectedAppointment.appointmentSlot)},
      { label: 'Status', value: selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)},
      { label: 'Created at', value: formatDate(selectedAppointment.createdAt)},
      { label: 'Reason', value: selectedAppointment.reason}
    ];
  }, [selectedAppointment]);

  return (
    <Layout>
      <Box sx={{ 
        borderRadius: 2, 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap', 
        justifyContent: 'space-between' 
      }}>
        <PageHeader title={pageTitle} />
        <SearchFilterbox value={searchFilter} onChange={setSearchFilter} />
      </Box>

      {/* Tabs for switching between list and create views */}
      {user?.roleName !== 'doctor' && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <CustomTabs value={activeTab} onChange={handleTabChange} tabs={tabOptions} />
          <AddButton
            onClick={handleCreateAppointment}
            label='Create New Appointment'
            startIcon={<Add />}
          />
        </Box>
      )}

      {/* Appointments List Tab */}
      {activeTab === 0 && (
        <Box>
          <AppointmentFilterChips filter={filter} onChange={setFilter} />
          
          <DataTable<Appointment>
            data={filteredAppointments}
            sortByDate={(a) => a.appointmentSlot}
            columns={tableColumns}
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
          onClick={() => selectedAppointmentForStatus && 
            handleStatusChange(selectedAppointmentForStatus, 'cancelled')}
          disabled={selectedAppointmentForStatus?.status === 'cancelled'}
        >
          Mark as Cancelled
        </MenuItem>
        <MenuItem 
          onClick={() => selectedAppointmentForStatus && 
            handleStatusChange(selectedAppointmentForStatus, 'no-show')}
          disabled={selectedAppointmentForStatus?.status === 'no-show'}
        >
          Mark as No-Show
        </MenuItem>
      </Menu>

      {/* Create/Edit Appointment Tab */}
      {activeTab === 1 && user?.roleName !== 'doctor' && (
        <AppointmentForm
          onSubmit={handleAppointmentSubmit}
          doctors={doctors}
          initialValues={selectedAppointment ? {
            patientId: selectedAppointment.patientId,
            doctorId: selectedAppointment.doctorId,
            appointmentSlot: selectedAppointment.appointmentSlot,
            reason: selectedAppointment.reason,
            status: selectedAppointment.status,
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
        fields={viewDialogFields}
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