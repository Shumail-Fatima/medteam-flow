import { useState, useMemo, useCallback } from 'react';
import type { Appointment } from '../types/appointment';
import type { ExtendedPatient } from '../types/medical';
import { formatDate, slotDate } from '../utils/DateUtils';

export type FilterType = 'all' | 'upcoming' | 'previous';

export interface AppointmentFilters {
  search: string;
  date: string;
  status: string;
  doctor: string;
  patient: string;
  filterType: FilterType;
}

export interface UseAppointmentFilteringProps {
  appointments: Appointment[];
  patients: ExtendedPatient[];
  userRole?: string;
  userId?: string;
}

export const useAppointmentFiltering = ({
  appointments,
  patients,
  userRole,
  userId
}: UseAppointmentFilteringProps) => {
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: '',
    date: '',
    status: '',
    doctor: '',
    patient: '',
    filterType: 'all'
  });

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Role-based filtering
      if (userRole === 'doctor' && appointment.doctorId !== userId) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchValue = filters.search.toLowerCase();
        const patientName = appointment.patientName?.toLowerCase() || '';
        const doctorName = appointment.doctorName?.toLowerCase() || '';
        const reason = appointment.reason?.toLowerCase() || '';
        
        if (!patientName.includes(searchValue) && 
            !doctorName.includes(searchValue) && 
            !reason.includes(searchValue)) {
          return false;
        }
      }

      // Date filter
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const appointmentDate = new Date(appointment.appointmentSlot);
        if (appointmentDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }

      // Status filter
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }

      // Doctor filter
      if (filters.doctor && appointment.doctorId !== filters.doctor) {
        return false;
      }

      // Patient filter
      if (filters.patient && appointment.patientId !== filters.patient) {
        return false;
      }

      // Filter type (all, upcoming, previous)
      if (filters.filterType !== 'all') {
        const now = new Date();
        const appointmentTime = new Date(appointment.appointmentSlot);
        
        if (filters.filterType === 'upcoming' && appointmentTime <= now) {
          return false;
        }
        
        if (filters.filterType === 'previous' && appointmentTime > now) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, patients, filters, userRole, userId]);

  // Update individual filter
  const updateFilter = useCallback((key: keyof AppointmentFilters, value: string | FilterType) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      date: '',
      status: '',
      doctor: '',
      patient: '',
      filterType: 'all'
    });
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key: keyof AppointmentFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'filterType' ? 'all' : ''
    }));
  }, []);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(appointments.map(a => a.status))];
    const uniqueDoctors = [...new Set(appointments.map(a => a.doctorId))];
    const uniquePatients = [...new Set(appointments.map(a => a.patientId))];

    return {
      statuses: uniqueStatuses.map(status => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      })),
      doctors: uniqueDoctors.map(doctorId => {
        const appointment = appointments.find(a => a.doctorId === doctorId);
        return {
          value: doctorId,
          label: appointment?.doctorName || 'Unknown Doctor'
        };
      }),
      patients: uniquePatients.map(patientId => {
        const patient = patients.find(p => p.id === patientId);
        return {
          value: patientId,
          label: patient?.name || 'Unknown Patient'
        };
      })
    };
  }, [appointments, patients]);

  // Get statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      noShow
    };
  }, [appointments]);

  return {
    filters,
    filteredAppointments,
    filterOptions,
    stats,
    updateFilter,
    clearFilters,
    clearFilter
  };
};
