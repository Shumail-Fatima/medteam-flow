import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Chip,
  IconButton,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Remove,
  Person,
  LocalHospital,
  Save,
  Schedule,
  Medication,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { RootState, AppDispatch } from '../store/Store';
import { addConsultation, updateConsultation, addMedicalHistoryEntry, updatePatientMedicalInfo } from '../store/slices/MedicalSlice';
import { updateAppointment } from '../store/slices/AppointmentSlice';
import { useAuth } from '../context/AuthContext';
import type { ConsultationFormData, Consultation, ExtendedAppointment } from '../types/medical';
import { consultationValidationSchema } from '../validation/MedValidation';

const ConsultationManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get URL parameters for pre-filling form
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');

  // Redux state - Get patients, appointments, and consultations
  const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const consultations = useSelector((state: RootState) => state.medical.consultations);

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Find pre-selected appointment and patient
  const preSelectedAppointment = useMemo(() => {
    return appointmentId ? appointments.find(apt => apt.id === appointmentId) : null;
  }, [appointments, appointmentId]);

  const preSelectedPatient = useMemo(() => {
    const targetPatientId = patientId || preSelectedAppointment?.patientId;
    return targetPatientId ? patients.find(p => p.id === targetPatientId) : null;
  }, [patients, patientId, preSelectedAppointment]);

  // Get doctor's patients (those who have had appointments)
  const doctorPatients = useMemo(() => {
    const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
    const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
    return patients.filter(patient => patientIds.includes(patient.id));
  }, [patients, appointments, user?.id]);

  // Get appointments for selected patient with current doctor
  const getPatientAppointments = (selectedPatientId: string) => {
    return appointments.filter(apt => 
      apt.patientId === selectedPatientId && 
      apt.doctorId === user?.id
    );
  };

  // React Hook Form setup with Yup validation
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(consultationValidationSchema),
    defaultValues: {
      patientId: preSelectedPatient?.id || '',
      appointmentId: preSelectedAppointment?.id || '',
      symptoms: '',
      diagnosis: '',
      notes: '',
      prescriptions: [
        {
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        }
      ],
      followUpRequired: false,
      followUpDate: '',
    },
  });

  // Field array for managing prescriptions
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prescriptions',
  });

  const watchedPatientId = watch('patientId');
  const watchedFollowUpRequired = watch('followUpRequired');

  // Get selected patient and their appointments
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === watchedPatientId);
  }, [patients, watchedPatientId]);

  const patientAppointments = useMemo(() => {
    return watchedPatientId ? getPatientAppointments(watchedPatientId) : [];
  }, [watchedPatientId, appointments, user?.id]);

  // Handle form submission - Redux action to create consultation
  const handleFormSubmit = async (data: ConsultationFormData) => {
    if (!user?.id || !selectedPatient) return;

    try {
      // Create consultation object
      const newConsultation: Consultation = {
        id: `cons_${Date.now()}`,
        patientId: data.patientId,
        patientName: selectedPatient.name,
        doctorId: user.id,
        doctorName: user.name,
        appointmentId: data.appointmentId,
        date: new Date().toISOString(),
        symptoms: data.symptoms.split(',').map(s => s.trim()).filter(s => s),
        diagnosis: data.diagnosis,
        notes: data.notes,
        prescriptions: data.prescriptions
          .filter(p => p.medication && p.dosage && p.frequency && p.duration)
          .map((p, index) => ({
            id: `rx_${Date.now()}_${index}`,
            ...p,
          })),
        followUpRequired: data.followUpRequired,
        followUpDate: data.followUpDate || undefined,
        createdAt: new Date().toISOString(),
        status: 'completed' as 'pending' | 'completed',
      };

      // Redux action - Add consultation to store
      dispatch(addConsultation(newConsultation));

      dispatch(updateConsultation({
        ...newConsultation, // the consultation object you want to update
        status: 'completed'
      }));

      // If consultation is linked to an appointment, mark it as completed
      if (data.appointmentId) {
        const appointment = appointments.find(apt => apt.id === data.appointmentId);
        if (appointment) {
          // Redux action - Update appointment status
          dispatch(updateAppointment({
            ...appointment,
            status: 'completed' as any,
            consultationCompleted: true,
          }));
        }
      }

      setSnackbar({
        open: true,
        message: 'Consultation recorded successfully!',
        severity: 'success'
      });

      // Reset form and navigate back
      reset();
      setTimeout(() => {
        navigate('/doc/dashboard');
      }, 1500);

    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to record consultation. Please try again.',
        severity: 'error'
      });
    }
  };

  const addPrescription = () => {
    append({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const removePrescription = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Consultation Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record patient consultations, diagnoses, and prescriptions
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={3}>
          {/* Patient Selection */}
          <Grid>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Patient Information
                </Typography>

                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={doctorPatients}
                      getOptionLabel={(option) => `${option.name} (Age: ${option.age})`}
                      value={doctorPatients.find(p => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
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
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {option.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Age: {option.age} • {option.email}
                              </Typography>
                            </Box>
                          </Box>
                        </li>
                      )}
                    />
                  )}
                />

                {/* Selected Patient Info */}
                {selectedPatient && (
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Selected Patient
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={selectedPatient.name} color="primary" size="small" />
                      <Chip label={`Age: ${selectedPatient.age}`} size="small" />
                      {selectedPatient.bloodType && (
                        <Chip label={`Blood: ${selectedPatient.bloodType}`} size="small" />
                      )}
                    </Box>
                    {selectedPatient.allergies.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="error.main" fontWeight="bold">
                          Allergies: {selectedPatient.allergies.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}

                {/* Appointment Selection */}
                <Controller
                  name="appointmentId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                        select
                        label="Link to Appointment (Optional)"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={!!errors.appointmentId}
                        helperText={errors.appointmentId?.message}
                        >
                        <MenuItem value="">No appointment</MenuItem>
                        {patientAppointments.map((appointment) => (
                            <MenuItem key={appointment.id} value={appointment.id}>
                            {formatDate(appointment.appointmentSlot)} - {appointment.reason || 'General'}
                            </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Consultation Details */}
          <Grid>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Consultation Details
                </Typography>

                <Controller
                  name="symptoms"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Symptoms"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.symptoms}
                      helperText={errors.symptoms?.message || 'Separate multiple symptoms with commas'}
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Controller
                  name="diagnosis"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Diagnosis"
                      fullWidth
                      error={!!errors.diagnosis}
                      helperText={errors.diagnosis?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Consultation Notes"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Prescriptions */}
          <Grid>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Prescriptions
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={addPrescription}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Prescription
                  </Button>
                </Box>

                {fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Prescription {index + 1}
                      </Typography>
                      {fields.length > 1 && (
                        <IconButton
                          onClick={() => removePrescription(index)}
                          color="error"
                          size="small"
                        >
                          <Remove />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid>
                        <Controller
                          name={`prescriptions.${index}.medication`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Medication"
                              fullWidth
                              size="small"
                              InputProps={{
                                startAdornment: <Medication sx={{ mr: 1, color: 'action.active' }} />,
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid>
                        <Controller
                          name={`prescriptions.${index}.dosage`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Dosage"
                              fullWidth
                              size="small"
                              placeholder="e.g., 10mg"
                            />
                          )}
                        />
                      </Grid>
                      <Grid>
                        <Controller
                          name={`prescriptions.${index}.frequency`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Frequency"
                              fullWidth
                              size="small"
                              placeholder="e.g., Twice daily"
                            />
                          )}
                        />
                      </Grid>
                      <Grid>
                        <Controller
                          name={`prescriptions.${index}.duration`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Duration"
                              fullWidth
                              size="small"
                              placeholder="e.g., 7 days"
                            />
                          )}
                        />
                      </Grid>
                      <Grid>
                        <Controller
                          name={`prescriptions.${index}.instructions`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Instructions"
                              fullWidth
                              size="small"
                              placeholder="e.g., Take with food"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Follow-up */}
          <Grid>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Follow-up
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid>
                    <Controller
                      name="followUpRequired"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          label="Follow-up Required"
                          fullWidth
                          value={field.value ? 'true' : 'false'}
                          onChange={(e) => field.onChange(e.target.value === 'true')}
                          error={!!errors.followUpRequired}
                          helperText={errors.followUpRequired?.message}
                        >
                        <MenuItem value="false">No</MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  {watchedFollowUpRequired && (
                    <Grid>
                      <Controller
                        name="followUpDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Follow-up Date"
                            type="datetime-local"
                            fullWidth
                            error={!!errors.followUpDate}
                            helperText={errors.followUpDate?.message}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/doc/dashboard')}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                }}
              >
                Save Consultation
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Success/Error Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Layout>
  );
};

export default ConsultationManagement;