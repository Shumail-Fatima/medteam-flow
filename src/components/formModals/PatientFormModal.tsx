import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  TextField, Box, Typography,IconButton,
} from '@mui/material';
import { DailogButton } from '../CustomButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// import type {  Patient } from '../../types/appointment';
import type {  Patient } from '../../types/medical';
import type { PatientFormData } from '../../types/medical';
import { Close } from '@mui/icons-material';
import { patientSchema } from '../../validation/PatientValidation';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
   patient?: Patient | null;
  //patient?: ExtendedPatient | null;
  isLoading?: boolean;
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
      address:'',
      emergencyContact:[
        {
          name: '',
          phone: '',
          relationship: ''
        }],
      allergies: [],
      bloodType: '',
      createdAt: ''
    },
  });

  // Reset form when patient data changes or modal opens
  useEffect(() => {
    if (patient){
      reset({
        ...patient
      });
    } else {
      reset({
        name: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        address:'',
      emergencyContact:[
        {
          name: '',
          phone: '',
          relationship: ''
        }]
      });
    }
  }, [patient, reset, open]);

  // utils/normalizeAllergies.ts
function normalizeAllergies(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String).map(s => s.trim());
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  return [];
}


  const handleFormSubmit = (data: PatientFormData) => {
    const normalizedAllergies = normalizeAllergies(data.allergies);
    const payload: PatientFormData = {
      ...data,
      allergies: normalizedAllergies,
      bloodType: data.bloodType,
    };
    onSubmit(payload);
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

            <TextField
              {...register('address')}
              label="Address"
              fullWidth
              disabled={isView}
              error={!!errors.address}
              helperText={errors.address?.message}
            />

            <TextField
              {...register('bloodType')}
              label="Blood Type (optional)"
              fullWidth
              disabled={isView}
              error={!!errors.bloodType}
              helperText={errors.bloodType?.message}
            />

            <TextField
              {...register('allergies', {
                setValueAs: (value) => normalizeAllergies(value),
              }) as any}
              label="Allergies (comma-separated)"
              placeholder="e.g., Penicillin, Nuts, Dust"
              fullWidth
              disabled={isView}
              error={!!errors.allergies}
              helperText={typeof errors.allergies?.message === 'string' ? errors.allergies?.message : ''}
            />

            <TextField
              {...register('emergencyContact.0.name')}
              label="Emergency contact Full Name"
              fullWidth
              disabled={isView}
              error={!!errors.emergencyContact?.[0]?.name}
              helperText={errors.emergencyContact?.[0]?.name?.message}
            />

            <TextField
              {...register('emergencyContact.0.phone')}
              label="Emergency contact Phone number"
              fullWidth
              disabled={isView}
              error={!!errors.emergencyContact?.[0]?.phone}
              helperText={errors.emergencyContact?.[0]?.phone?.message}
            />

            <TextField
              {...register('emergencyContact.0.relationship')}
              label="Emergency contact relationship with patient"
              fullWidth
              disabled={isView}
              error={!!errors.emergencyContact?.[0]?.relationship}
              helperText={errors.emergencyContact?.[0]?.relationship?.message}
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