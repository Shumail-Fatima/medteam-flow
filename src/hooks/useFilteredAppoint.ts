// hooks/useFilteredAppointments.ts
import { useMemo } from 'react';
import type { Appointment, Patient } from '../types/appointment';

type Filter = 'all' | 'today' | 'upcoming' | 'previous';

export const useFilteredAppointments = (
  appointments: Appointment[],
  patients: Patient[],
  filter: Filter,
  search: string
) => {
  return useMemo(() => {
    const now = new Date();

    return appointments.filter((appointment) => {
      const slotDate = new Date(appointment.appointmentSlot);

      if (filter === 'upcoming') {
        return (
          appointment.status === 'scheduled' &&
          (slotDate > now ||
            (slotDate.getFullYear() === now.getFullYear() &&
              slotDate.getMonth() === now.getMonth() &&
              slotDate.getDate() === now.getDate()))
        );
      }

      if (filter === 'previous') {
        return (
          appointment.status === 'completed' ||
          (slotDate < now &&
            (slotDate.getFullYear() !== now.getFullYear() ||
              slotDate.getMonth() !== now.getMonth() ||
              slotDate.getDate() !== now.getDate()))
        );
      }

      // Apply search filter
      const patient = patients.find((p) => p.id === appointment.patientId);
      return search ? patient?.name.toLowerCase().includes(search.toLowerCase()) : true;
    });
  }, [appointments, patients, filter, search]);
};
