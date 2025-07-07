import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import {
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import type { LoginFormData } from '../types/Auth';

interface ControlledCheckboxProps {
  name: keyof LoginFormData;
  control: Control<LoginFormData>;
  label: string;
}

const ControlledCheckbox: React.FC<ControlledCheckboxProps> = ({
  name,
  control,
  label,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={value as boolean}
              onChange={onChange}
              color="primary"
            />
          }
          label={label}
        />
      )}
    />
  );
};

export default ControlledCheckbox;