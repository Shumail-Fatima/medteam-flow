import React, { useState, useMemo, useEffect } from 'react';
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
import { Add, Person, LocalHospital, Category, Label } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { RootState, AppDispatch } from '../../store/Store';
import { useSelector, useDispatch } from 'react-redux';
import type { Appointment, AppointmentFormData, DoctorOption, Patient } from '../../types/appointment';
import { setSelectedSpecialty, clearSpecialtyFilter } from '../../store/slices/DoctorSlice';
import PatientFormModal from './PatientFormModal';
import { appointmentValidationSchema } from '../../validation/AppointmentValid';
import { fetchPatients, addPatientAsync } from '../../store/slices/PatientSlice';

interface AppointmentFormProps {
    onSubmit: (data: AppointmentFormData) => void;
    doctors: DoctorOption[];
    initialValues?: Partial<AppointmentFormData>;
    mode?: 'create'|'edit';
    isLoading?: boolean;
    onAddPatient: (patientData: any) => void;
}

const  AppointmentForm: React.FC <AppointmentFormProps> = ({
    onSubmit, doctors, initialValues= {}, mode= 'create', 
    isLoading= false, onAddPatient,
}) => {
    //Get patients from Redux store
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
      dispatch(fetchPatients());
    }, [dispatch]);

    const patients = useSelector((state: RootState) => state.patients.patients);
    const specialties = useSelector((state: RootState) => state.doctors.specialties);
    const selectedSpecialtyId = useSelector((state: RootState) => state.doctors.selectedSpecialtyId);

    const [patientModalOpen, setPatientModalOpen] = useState(false);

    //React hook form setup with yup validation
    const {
        control, handleSubmit, watch, reset, setValue, formState: {errors},
    } = useForm<AppointmentFormData>({
        resolver: yupResolver(appointmentValidationSchema),
        defaultValues:{
            specialtyId: '',
            patientId: '',
            doctorId: '',
            appointmentSlot: '',
            reason: '',
            status: 'scheduled',
            ...initialValues,
        },
    });

    const selectedDoctorId = watch('doctorId');
    const selectedPatientId = watch('patientId');
    const watchedSpecialtyId = watch('specialtyId');

    // find selected doctor and patient for displaying additional info
    const selectedDoctor = doctors.find(d => d.value === selectedDoctorId);
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    // Filter doctors based on selected specialty using Redux state
    const filteredDoctors = useMemo(() => {
      const specialtyToFilter = selectedSpecialtyId || watchedSpecialtyId;
      if (!specialtyToFilter){
        return doctors;
      }
      return doctors.filter(doctor => doctor.specialtyId === specialtyToFilter);
    },[doctors, selectedSpecialtyId, watchedSpecialtyId]);

    //prepare patient options for autocomplete
    const patientOptions = patients.map(patient => ({
        label: `${patient.name} (Age: ${patient.age})`,
        value: patient.id,
        patient: patient,
    }));

    const statusOptions = ["scheduled" , "completed" , "cancelled" , "no-show"];

    const specialtyOptions = [
      {label: 'All Specialties', value: ''},
      ...specialties.map(specialty => ({
        label: specialty.name,
        value: specialty.id,
        description: specialty.description,
      }))
    ];

    const handleFormSubmit = (data: AppointmentFormData) => {
        onSubmit(data);
        if (mode === 'create'){
            reset();
        }
    };

    const handleAddNewPatient = () => {
        setPatientModalOpen(true);
    };

    const handlePatientAdd = (patientData: any) => {
        //onAddPatient(patientData);
        dispatch(addPatientAsync(patientData));
        setPatientModalOpen(false);
    };


    // Handle specialty selection and filter doctors using Redux
    const handleSpecialtyChange = (specialtyId: string) => {
    setValue('specialtyId', specialtyId);
    setValue('doctorId', ''); // Clear doctor selection when specialty changes
    setValue('appointmentSlot', ''); // Clear appointment slot when doctor changes
    
    // Redux action - Set selected specialty for filtering
    dispatch(setSelectedSpecialty(specialtyId || null));
  };

  // Handle doctor selection and clear appointment slot
  const handleDoctorChange = (doctorId: string) => {
    setValue('doctorId', doctorId);
    setValue('appointmentSlot', ''); // Clear appointment slot when doctor changes
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
                disabled={mode === 'edit'} // Only editable in create mode
                onChange={(_, newValue) => {
                  field.onChange(newValue?.value || '');
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
                            <Person sx={{ mr: 1, color: 'action.active' }} />
                            <Box>
                                <Typography variant="body2">
                                    {option.patient?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Age: {option.patient?.age} • {option.patient?.email}
                                </Typography>
                            </Box>
                        </Box>
                    </li>
                )}
              />
            )}
          />

          {/* Add New Patient Button */}
          <Button
            type="button"
            variant="text"
            startIcon={<Add />}
            onClick={handleAddNewPatient}
            disabled={mode === 'edit'}
            sx={{
              alignSelf: 'flex-end',
              borderRadius: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.light',
              },
            }}
          >
            Register New Patient
          </Button>

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

          {/* Doctor Specialty Selection */}
          <Controller
            name="specialtyId"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Doctor Specialty"
                fullWidth
                value={field.value }
                onChange={(e) => {
                  field.onChange(e.target.value);
                  handleSpecialtyChange(e.target.value);
                }}
                InputProps={{
                  startAdornment: <Category sx={{ mr: 1, color: 'action.active' }} />,
                }}
              >
                {specialtyOptions.map((specialty) => (
                  <MenuItem key={specialty.value} value={specialty.value}>
                    <Box>
                      <Typography variant="body2" fontWeight={specialty.value === '' ? 'bold' : 'normal'}>
                        {specialty.label}
                      </Typography>
                      {/* specialty. && (
                        <Typography variant="caption" color="text.secondary">
                          {specialty.description}
                        </Typography>
                      ) */}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Doctor Selection - Filtered by Specialty */}
          <Controller
            name="doctorId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={filteredDoctors}
                getOptionLabel={(option) => option.label}
                value={filteredDoctors.find(d => d.value === field.value) || null}
                onChange={(_, newValue) => {
                  const doctorId = newValue?.value || '';
                  field.onChange(doctorId);
                  handleDoctorChange(doctorId);
                }}
                disabled={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Doctor"
                    error={!!errors.doctorId}
                    helperText={
                      watchedSpecialtyId === ''
                        ? 'Showing all doctors'
                        : errors.doctorId?.message
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocalHospital sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <LocalHospital sx={{ mr: 1, color: 'action.active' }} />
                      <Box>
                        <Typography variant="body2">
                          {option.label}
                        </Typography>
                        {option.specialtyName && (
                          <Typography variant="caption" color="text.secondary">
                            {option.specialtyName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </li>
                )}
              />
            )}
          />

          {/* Selected Doctor Info */}
          {selectedDoctor && (
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="body2" color="primary.contrastText" gutterBottom>
                Selected Doctor
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={selectedDoctor.label} 
                  color="primary" 
                  size="small" 
                  sx={{ color: 'white', bgcolor: 'primary.dark' }}
                />
                {selectedDoctor.specialtyName && (
                  <Chip 
                    label={selectedDoctor.specialtyName} 
                    size="small" 
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  />
                )}
              </Box>
            </Box>
          )}

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
          
          {/* Appointment Status */}
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Appointment Status"
                fullWidth
                error={!!errors.status}
                helperText={errors.status?.message || "Select the current status of the appointment"}
                value={field.value}
                onChange={field.onChange}
                InputProps={{
                  startAdornment: <Label sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }
                }}
              >
                <MenuItem value="scheduled">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    Scheduled
                  </Box>
                </MenuItem>
                <MenuItem value="completed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    Completed
                  </Box>
                </MenuItem>
                <MenuItem value="cancelled">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    Cancelled
                  </Box>
                </MenuItem>
                <MenuItem value="no-show">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    No Show
                  </Box>
                </MenuItem>
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              borderRadius: 3,
              minWidth: 180, // or any standard width you prefer
              py: 1.5,
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #115293 0%, #1976d2 100%)',
              },
            }}
          >
            {mode === 'edit' ? 'Update Appointment' : 'Create Appointment'}
          </Button>
        </Box>

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
}

export default AppointmentForm