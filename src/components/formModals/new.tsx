import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Add, Person } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/Store';
//import type { AppointmentFormData, DoctorOption, Patient } from '../types/appointment';
import type { AppointmentFormData, DoctorOption, Patient } from '../../types/appointment';
import PatientFormModal from './PatientFormModal';

// Validation schema for appointment form using Yup
const appointmentSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  doctorId: yup.string().required('Doctor is required'),
  appointmentSlot: yup.string().required('Appointment slot is required'),
  reason: yup.string(),
});

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  doctors: DoctorOption[];
  initialValues?: Partial<AppointmentFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
  onAddPatient: (patientData: any) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  doctors,
  initialValues = {},
  mode = 'create',
  isLoading = false,
  onAddPatient,
}) => {
  // Get patients from Redux store
  const patients = useSelector((state: RootState) => state.patients.patients);
  
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  // React Hook Form setup with Yup validation
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      appointmentSlot: '',
      reason: '',
      ...initialValues,
    },
  });

  const selectedDoctorId = watch('doctorId');
  const selectedPatientId = watch('patientId');
  
  // Find selected doctor and patient for displaying additional info
  const selectedDoctor = doctors.find(d => d.value === selectedDoctorId);
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Prepare patient options for autocomplete with "Add New Patient" option
  const patientOptions = [
    ...patients.map(patient => ({
      label: `${patient.name} (Age: ${patient.age})`,
      value: patient.id,
      patient: patient,
    })),
    {
      label: '+ Register New Patient',
      value: 'add_new',
      patient: null,
    }
  ];

  const handleFormSubmit = (data: AppointmentFormData) => {
    onSubmit(data);
    if (mode === 'create') {
      reset();
    }
  };

  const handlePatientSelect = (value: string | null) => {
    if (value === 'add_new') {
      setPatientModalOpen(true);
    }
  };

  const handlePatientAdd = (patientData: any) => {
    onAddPatient(patientData);
    setPatientModalOpen(false);
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        {mode === 'edit' ? 'Edit Appointment' : 'Create New Appointment'}
      </Typography>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Patient Selection */}
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={patientOptions}
                getOptionLabel={(option) => option.label}
                value={patientOptions.find(p => p.value === field.value) || null}
                onChange={(_, newValue) => {
                  if (newValue?.value === 'add_new') {
                    handlePatientSelect('add_new');
                  } else {
                    field.onChange(newValue?.value || '');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    error={!!errors.patientId}
                    helperText={errors.patientId?.message}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {option.value === 'add_new' ? (
                        <>
                          <Add sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography color="primary.main" fontWeight="medium">
                            {option.label}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Person sx={{ mr: 1, color: 'action.active' }} />
                          <Box>
                            <Typography variant="body2">
                              {option.patient?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Age: {option.patient?.age} • {option.patient?.email}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </li>
                )}
              />
            )}
          />

          {/* Selected Patient Info */}
          {selectedPatient && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Patient
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${selectedPatient.name}`} color="primary" size="small" />
                <Chip label={`Age: ${selectedPatient.age}`} size="small" />
                <Chip label={selectedPatient.email} size="small" />
              </Box>
            </Box>
          )}

          {/* Doctor Selection */}
          <Controller
            name="doctorId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={doctors}
                getOptionLabel={(option) => option.label}
                value={doctors.find(d => d.value === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.value || '')}
                disabled={mode === 'edit'} // Only editable in create mode
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Doctor"
                    error={!!errors.doctorId}
                    helperText={errors.doctorId?.message || (mode === 'edit' ? 'Doctor can only be changed in create mode' : '')}
                  />
                )}
              />
            )}
          />

          {/* Appointment Slot Selection */}
          <Controller
            name="appointmentSlot"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Appointment Slot"
                fullWidth
                disabled={!selectedDoctor}
                error={!!errors.appointmentSlot}
                helperText={
                  !selectedDoctor
                    ? 'Select a doctor to see available slots'
                    : errors.appointmentSlot?.message
                }
                {...field}
              >
                {selectedDoctor?.availableSlots.length ? (
                  selectedDoctor.availableSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {new Date(slot).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    {selectedDoctor ? 'No slots available' : 'Select a doctor first'}
                  </MenuItem>
                )}
              </TextField>
            )}
          />

          {/* Reason for Visit */}
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                label="Reason for Visit (Optional)"
                fullWidth
                multiline
                rows={3}
                {...field}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #115293 0%, #1976d2 100%)',
              },
            }}
          >
            {mode === 'edit' ? 'Update Appointment' : 'Create Appointment'}
          </Button>
        </Box>
      </form>

      {/* Patient Registration Modal */}
      <PatientFormModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSubmit={handlePatientAdd}
        mode="create"
      />
    </Paper>
  );
};

export default AppointmentForm;