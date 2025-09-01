import React from 'react';
import { Box, IconButton, Tooltip, type IconButtonProps } from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  MoreVert,
  PlayArrow,
  Schedule,
} from '@mui/icons-material';

export interface ActionButton {
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: IconButtonProps['color'];
  size?: IconButtonProps['size'];
}

export interface ActionButtonsProps {
  actions: ActionButton[];
  size?: IconButtonProps['size'];
  sx?: React.ComponentProps<typeof Box>['sx'];
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  size = 'small',
  sx = {},
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, ...sx }}>
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.label}>
          <IconButton
            size={size}
            onClick={action.onClick}
            disabled={action.disabled}
            color={action.color}
            sx={{ p: 0.5 }}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

// Predefined action sets for common use cases
export const createViewAction = (onView: () => void, disabled = false): ActionButton => ({
  icon: <Visibility />,
  label: 'View',
  onClick: onView,
  disabled,
  color: 'primary',
});

export const createEditAction = (onEdit: () => void, disabled = false): ActionButton => ({
  icon: <Edit />,
  label: 'Edit',
  onClick: onEdit,
  disabled,
  color: 'primary',
});

export const createDeleteAction = (onDelete: () => void, disabled = false): ActionButton => ({
  icon: <Delete />,
  label: 'Delete',
  onClick: onDelete,
  disabled,
  color: 'error',
});

export const createStartAction = (onStart: () => void, disabled = false): ActionButton => ({
  icon: <PlayArrow />,
  label: 'Start',
  onClick: onStart,
  disabled,
  color: 'success',
});

export const createScheduleAction = (onSchedule: () => void, disabled = false): ActionButton => ({
  icon: <Schedule />,
  label: 'Schedule',
  onClick: onSchedule,
  disabled,
  color: 'info',
});

export const createMoreActionsAction = (onClick: () => void, disabled = false): ActionButton => ({
  icon: <MoreVert />,
  label: 'More Actions',
  onClick,
  disabled,
  color: 'default',
});

export default ActionButtons;
