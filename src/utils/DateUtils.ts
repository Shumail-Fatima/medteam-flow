import type { Appointment } from "../types/appointment";

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  export const slotDate = (appointment: Appointment) => {
    const slotDate = new Date(appointment.appointmentSlot);
    const now = new Date();
    const isPast =
        slotDate < now &&
        (
          slotDate.getFullYear() !== now.getFullYear() ||
          slotDate.getMonth() !== now.getMonth() ||
          slotDate.getDate() !== now.getDate()
        );
    return isPast;
  };