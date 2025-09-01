import React from 'react';
import { Box, Typography, Chip, Button, IconButton } from '@mui/material';
import { CalendarToday, MoreVert } from '@mui/icons-material';
import type { Appointment } from '../../types/appointment';
import { formatDate, slotDate } from '../../utils/DateUtils';
import StatusChip from '../sharedComponents/StatusChip';

export interface AppointmentTableColumnsProps {
  userRole?: string;
  onStatusMenuOpen: (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => void;
  onStartConsultation: (appointment: Appointment) => void;
}

// Helper function for status colors
const getStatusColor = (status: string) => {
  const statusColors: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'default'> = {
    scheduled: 'primary',
    completed: 'success',
    cancelled: 'error',
    'no-show': 'warning',
  };
  return statusColors[status] || 'default';
};

export const createAppointmentTableColumns = ({
  userRole,
  onStatusMenuOpen,
  onStartConsultation
}: AppointmentTableColumnsProps) => [
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
      const canChangeStatus = slotDate(appointment) || userRole === 'admin';
      const isPastSlot = !slotDate(appointment);
      
      if (canChangeStatus) {
        return (
          <StatusChip 
            status={appointment.status}
            customConfigs={{
              scheduled: {
                label: 'Scheduled',
                color: 'primary',
                icon: <CalendarToday />,
              },
              completed: {
                label: 'Completed',
                color: 'success',
                icon: <CalendarToday />,
              },
              cancelled: {
                label: 'Cancelled',
                color: 'error',
                icon: <CalendarToday />,
              },
              'no-show': {
                label: 'No Show',
                color: 'warning',
                icon: <CalendarToday />,
              },
            }}
          />
        );
      } else if (isPastSlot) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onStartConsultation(appointment)}
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
    header: 'Actions',
    render: (appointment: Appointment) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          size="small"
          onClick={(e) => onStatusMenuOpen(e, appointment)}
          sx={{ p: 0.5 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>
    )
  },
];

export default createAppointmentTableColumns;
