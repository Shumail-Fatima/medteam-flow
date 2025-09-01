import React from 'react';
import { Chip, type ChipProps } from '@mui/material';
import {
  CheckCircle,
  Pending,
  PlayArrow,
  Schedule,
  Cancel,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';

export interface StatusConfig {
  label: string;
  color: ChipProps['color'];
  icon: React.ReactElement;
}

export interface StatusChipProps {
  status: string;
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
  sx?: ChipProps['sx'];
  customConfigs?: Record<string, StatusConfig>;
}

const defaultStatusConfigs: Record<string, StatusConfig> = {
  // Task statuses
  'Pending': {
    label: 'Pending',
    color: 'warning',
    icon: <Pending />,
  },
  'In Progress': {
    label: 'In Progress',
    color: 'info',
    icon: <PlayArrow />,
  },
  'Done': {
    label: 'Done',
    color: 'success',
    icon: <CheckCircle />,
  },
  
  // Appointment statuses
  'scheduled': {
    label: 'Scheduled',
    color: 'primary',
    icon: <Schedule />,
  },
  'completed': {
    label: 'Completed',
    color: 'success',
    icon: <CheckCircle />,
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'error',
    icon: <Cancel />,
  },
  'no-show': {
    label: 'No Show',
    color: 'warning',
    icon: <Warning />,
  },
  
  // User roles
  'admin': {
    label: 'Admin',
    color: 'error',
    icon: <Info />,
  },
  'doctor': {
    label: 'Doctor',
    color: 'primary',
    icon: <Info />,
  },
  'nurse': {
    label: 'Nurse',
    color: 'secondary',
    icon: <Info />,
  },
  
  // Consultation statuses
  'active': {
    label: 'Active',
    color: 'info',
    icon: <PlayArrow />,
  },
  'consultCompleted': {
    label: 'Completed',
    color: 'success',
    icon: <CheckCircle />,
  },
  'pending': {
    label: 'Pending',
    color: 'warning',
    icon: <Pending />,
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'small',
  variant = 'filled',
  sx = {},
  customConfigs = {},
}) => {
  const allConfigs = { ...defaultStatusConfigs, ...customConfigs };
  const config = allConfigs[status] || {
    label: status,
    color: 'default' as ChipProps['color'],
    icon: <Info />,
  };

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 'bold',
        minWidth: 120,
        ...sx,
      }}
    />
  );
};

export default StatusChip;
