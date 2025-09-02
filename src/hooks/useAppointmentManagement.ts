import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/Store';
import { 
  fetchAppointments, 
  addAppointmentAsync, 
  updateAppointmentAsync, 
  deleteAppointmentAsync 
} from '../store/slices/AppointmentSlice';
import { fetchPatients } from '../store/slices/PatientSlice';
import type { Appointment, AppointmentFormData } from '../types/appointment';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';
import { useDoctors } from '../hooks/useDoctors';
import { formatDate } from '../utils/DateUtils';

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";
export type FilterType = 'all' | 'upcoming' | 'previous';

export interface UseAppointmentManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useAppointmentManagement = ({ onSuccess, onError }: UseAppointmentManagementProps = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendNotification } = useNotification();
  
  // Selectors
  const allAppointments = useSelector((state: RootState) => state.appointments.appointments);
  const patients = useSelector((state: RootState) => state.patients.patients);
  const appointmentsLoading = useSelector((state: RootState) => state.appointments.loading);
  const patientsLoading = useSelector((state: RootState) => state.patients.loading);
  
  // Custom hooks
  const doctors = useDoctors();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointmentForStatus, setSelectedAppointmentForStatus] = useState<Appointment | null>(null);

  // Memoized values
  const appointments = useMemo(() => {
    if (!user || user.roleName !== 'doctor') return allAppointments;
    return allAppointments.filter((a) => a.doctorId === user.id);
  }, [allAppointments, user]);

  const tabOptions = useMemo(() => {
    if (user?.roleName === 'doctor') {
      return [{ label: 'Appointments List' }];
    }
    return [
      { label: 'Appointments List' },
      { label: 'Create Appointment' },
    ];
  }, [user?.roleName]);

  const pageTitle = useMemo(() => {
    return 'Appointments';
  }, []);

  // Effects - Only fetch once on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          dispatch(fetchPatients()).unwrap(),
          dispatch(fetchAppointments()).unwrap(),
        ]);
      } catch (error) {
        onError?.('Failed to fetch data');
      }
    };

    // Only fetch if we don't have data and aren't already loading
    if (allAppointments.length === 0 && patients.length === 0 && !appointmentsLoading && !patientsLoading) {
      initializeData();
    }
  }, []); // Empty dependency array - only run on mount

  // Event handlers
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
    onSuccess?.(`Viewing appointment for ${appointment.patientName}`);
  }, [onSuccess]);

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
      onSuccess?.('Appointment deleted successfully!');
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      onError?.('Failed to delete appointment');
    }
  }, [appointmentToDelete, dispatch, onSuccess, onError]);

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
      const receiveId = String(user?.roleId) === '1' 
        ? appointment.doctorId 
        : appointment.createdById || '';

      // Determine notification action
      const notificationAction = newStatus === 'cancelled' 
        ? 'cancelled' 
        : 'updated';

      // Create and send notification
      const notification = NotificationService.createAppointmentNotification(
        receiveId,
        user?.id || '',
        appointment.id,
        appointment.patientId,
        appointment.patientName,
        appointment.doctorName,
        appointment.appointmentSlot,
        notificationAction
      );
      sendNotification(notification);
      
      onSuccess?.(`Appointment status changed to ${newStatus} successfully!`);
      
      // Close the status menu
      setStatusMenuAnchor(null);
      setSelectedAppointmentForStatus(null);
    } catch (error) {
      onError?.('Failed to update appointment status');
    }
  }, [user, dispatch, sendNotification, onSuccess, onError]);

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
      const selectedSpecialty = doctors.find(d => d.value === data.doctorId)?.specialtyName;

      if (!selectedPatient || !selectedDoctor) {
        onError?.('Invalid patient or doctor selection');
        return;
      }

      if (selectedAppointment) {
        // Update existing appointment
        const updatedAppointment: Appointment = {
          ...selectedAppointment,
          specialtyName: selectedSpecialty,
          doctorId: data.doctorId,
          doctorName: selectedDoctor.label,
          appointmentSlot: data.appointmentSlot,
          reason: data.reason,
          status: data.status,
        };

        await dispatch(updateAppointmentAsync(updatedAppointment)).unwrap();
        
        // Send notification
        const notificationAction = data.status === 'cancelled' 
          ? 'cancelled' 
          : 'updated';
          
        const notification = NotificationService.createAppointmentNotification(
          selectedAppointment.doctorId,
          user?.id || '',
          selectedAppointment.id,
          selectedAppointment.patientId,
          selectedAppointment.patientName,
          selectedAppointment.doctorName,
          selectedAppointment.appointmentSlot,
          notificationAction
        );
        sendNotification(notification);

        onSuccess?.('Appointment updated successfully!');
      } else {
        // Create new appointment
        const newAppointment: Appointment = {
          id: `apt_${Date.now()}`,
          patientId: data.patientId,
          patientName: selectedPatient.name,
          patientAge: selectedPatient.age || 0,
          specialtyName: selectedSpecialty,
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
          newAppointment.id,
          newAppointment.patientId,
          newAppointment.patientName,
          newAppointment.doctorName,
          newAppointment.appointmentSlot,
          'created'
        );
        sendNotification(notification);

        onSuccess?.('Appointment created successfully!');
      }

      // Switch back to appointments list tab
      setActiveTab(0);
      setSelectedAppointment(null);
    } catch (error) {
      onError?.('Failed to save appointment');
    }
  }, [selectedAppointment, patients, doctors, user?.id, dispatch, sendNotification, onSuccess, onError]);

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

  return {
    // State
    activeTab,
    selectedAppointment,
    deleteDialogOpen,
    viewDialogOpen,
    appointmentToDelete,
    statusMenuAnchor,
    selectedAppointmentForStatus,
    
    // Data
    appointments,
    patients,
    doctors,
    tabOptions,
    pageTitle,
    viewDialogFields,
    
    // Loading states
    appointmentsLoading,
    patientsLoading,
    
    // Actions
    handleTabChange,
    handleCreateAppointment,
    handleViewAppointment,
    handleEditAppointment,
    handleDeleteAppointment,
    confirmDelete,
    handleStatusChange,
    handleStatusMenuOpen,
    handleStatusMenuClose,
    handleAppointmentSubmit,
    handleStartConsultation,
    handleAddPatient,
    
    // Setters
    setDeleteDialogOpen,
    setViewDialogOpen,
    setAppointmentToDelete,
  };
};
