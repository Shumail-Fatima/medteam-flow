import React from 'react';
import { Controller, type Control, type FieldError } from 'react-hook-form';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import type { LoginFormData } from '../types/Auth';

interface ControlledTextFieldProps {
  name: keyof LoginFormData;
  control: Control<LoginFormData>;
  label: string;
  type?: string;
  error?: FieldError;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
  endIconAriaLabel?: string;
}

const ControlledTextField: React.FC<ControlledTextFieldProps> = ({
  name,
  control,
  label,
  type = 'text',
  error,
  startIcon,
  endIcon,
  onEndIconClick,
  endIconAriaLabel,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          type={type}
          error={!!error}
          helperText={error?.message}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: startIcon && (
              <InputAdornment position="start">
                {startIcon}
              </InputAdornment>
            ),
            endAdornment: endIcon && (
              <InputAdornment position="end">
                <IconButton
                  onClick={onEndIconClick}
                  edge="end"
                  aria-label={endIconAriaLabel}
                >
                  {endIcon}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default ControlledTextField;