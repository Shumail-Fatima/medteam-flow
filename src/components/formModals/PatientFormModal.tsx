import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, MenuItem, Autocomplete, Typography,IconButton,
} from '@mui/material';
import { DailogButton } from '../CustomButton';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { PatientFormData, Patient } from '../../types/appointment';
import { Close } from '@mui/icons-material';

const patientSchema = yup.object({
  name: yup.string().required('Patient name is required').min(2, 'Name must be at least 2 characters'),
  dateOfBirth:yup.string().required('Date of birth is required'),
  email:yup.string().email('Invalid email').required('Email is required'),
  phone:yup.string().required('Phone number is required'),
});

interface DoctorOption {
  label: string;
  value: string;
  availableSlots: string[];
}

interface PatientFormValues {
  name: string;
  email: string;
  phone: string;
  doctorId: string;
  appointmentSlot: string;
  reason: string;
}

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  patient?: Patient | null;
  isLoading?: boolean;
  //initialValues?: Partial<PatientFormValues>;
  //doctors: DoctorOption[];
  mode?: 'create' | 'edit' | 'view';
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  open, onClose, onSubmit, patient, 
  isLoading = false,
  mode = 'create',
}) => {
  const isEdit = !!patient;
  const isView = mode === 'view'

  // React Hook Form setup with Yup validation
  const {
    register, handleSubmit, reset, formState: {errors},
  } = useForm<PatientFormData>({
    resolver: yupResolver(patientSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      email: '',
      phone: '',
    },
  });

  // Reset form when patient data changes or modal opens
  useEffect(() => {
    if (patient){
      reset({
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email,
        phone: patient.phone,
      });
    } else {
      reset({
        name: '',
        dateOfBirth: '',
        email: '',
        phone: '',
      });
    }
  }, [patient, reset, open]);

  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {isView ? 'Patient Details' : isEdit ? 'Edit Patient' : 'Register New Patient'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isView ? 'View patient information' : isEdit ? 'Update patient information' : 'Enter patient details to register'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              {...register('name')}
              label="Full Name"
              fullWidth
              disabled={isView}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              {...register('dateOfBirth')}
              label="Date of Birth"
              type="date"
              fullWidth
              disabled={isView}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              {...register('email')}
              label="Email Address"
              type="email"
              fullWidth
              disabled={isView}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              {...register('phone')}
              label="Phone Number"
              fullWidth
              disabled={isView}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Box>
        </DialogContent>

        <DailogButton
        onCancel={handleClose}
        isLoading={isLoading}
        />
      </form>
    </Dialog>
  );
}



export default PatientFormModal;