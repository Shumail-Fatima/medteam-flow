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
import { fetchConsultations, addConsultationAsync, updateConsultationAsync } from '../store/slices/MedicalSlice';
import { updateAppointment, fetchAppointments, updateAppointmentAsync } from '../store/slices/AppointmentSlice';
import { useAuth } from '../context/AuthContext';
import type { ConsultationFormData, Consultation } from '../types/medical';
import { consultationValidationSchema } from '../validation/MedValidation';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import PageHeader from '../components/sharedComponents/PageHeader';
import PatientInfoCard from '../components/PatientInfoCard';
import AppointmentSection from '../components/AppointmentSection';
import ConsultationDetailsSection from '../components/ConsultDetails';
import PrescriptionsSection from '../components/PrescriptionSection';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';


const ConsultationManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { sendNotification } = useNotification();


  // Get URL parameters for pre-filling form
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');

  // Redux state - Get patients, appointments, and consultations
  //const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const patients = useSelector((state: RootState) => state.patients.patients);
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  //const consultations = useSelector((state: RootState) => state.medical.consultations);

  // Inside your component:
  const { consultationId } = useParams();
  const isReadOnly = !!consultationId;

  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const consultationRecord = consultationId
    ? consultations.find(c => c.id === consultationId)
    : null;



  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);
  // Find pre-selected appointment and patient
  const preSelectedAppointment = useMemo(() => {
    if (consultationRecord && consultationRecord.appointmentId) {
      return appointments.find(apt => apt.id === consultationRecord.appointmentId) || null;
    }
    return appointmentId ? appointments.find(apt => apt.id === appointmentId) : null;
  }, [appointments, appointmentId, consultationRecord]);
  
  const preSelectedPatient = useMemo(() => {
    if (consultationRecord) {
      return patients.find(p => p.id === consultationRecord.patientId) || null;
    }
    const targetPatientId = patientId || preSelectedAppointment?.patientId;
    return targetPatientId ? patients.find(p => p.id === targetPatientId) : null;
  }, [patients, consultationRecord, patientId, preSelectedAppointment]);

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

    // Fetch users from API on component mount
    useEffect(() => {
    dispatch(fetchConsultations()); // Load users from backend on mount
  }, [dispatch]);

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
      // dispatch(addConsultation(newConsultation));
      dispatch(addConsultationAsync(newConsultation));

      // dispatch(updateConsultation({
      //   ...newConsultation, // the consultation object you want to update
      //   status: 'completed'
      // }));
      dispatch(updateConsultationAsync({
        ...newConsultation, // the consultation object you want to update
        status: 'completed'
      }));

      if (newConsultation.followUpRequired === true){
        const notification = NotificationService.createConsultationNotification(
          newConsultation.doctorId,
          //user?.id ,
          user?.id || '',
          newConsultation.id,
          newConsultation.patientName,
          'followup_required'
        );
        sendNotification(notification);
      };
      
      
      // Send notification to the doctor
      const notification = NotificationService.createConsultationNotification(
        newConsultation.doctorId,
        user?.id || '',
        newConsultation.id,
        newConsultation.patientName,
        'completed'
      );
      sendNotification(notification);
    

      // If consultation is linked to an appointment, mark it as completed
      if (data.appointmentId) {
        const appointment = appointments.find(apt => apt.id === data.appointmentId);
        if (appointment) {
          // Redux action - Update appointment status
          dispatch(updateAppointmentAsync({
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
        navigate('/consultations-records');
      }, 1500);

    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to record consultation. Please try again.',
        severity: 'error'
      });
    }
  };

  
    // ... inside your component
    useEffect(() => {
      if (consultationRecord) {
        reset({
          patientId: consultationRecord.patientId,
          appointmentId: consultationRecord.appointmentId,

          symptoms: consultationRecord.symptoms.join(', '),
          diagnosis: consultationRecord.diagnosis,
          notes: consultationRecord.notes,
          prescriptions: consultationRecord.prescriptions,
          followUpRequired: consultationRecord.followUpRequired,
          followUpDate: consultationRecord.followUpDate || '',
        });
      }
    }, [consultationRecord, reset]);

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
      <PageHeader
        title="Consultation Management"
        // subtitle="Record patient consultations, diagnoses, and prescriptions"
      />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={3}>
          
          {/* Patient Selection */}
          <Grid size={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Patient Information
                </Typography>

                {preSelectedPatient ? (
                  <PatientInfoCard
                  name={preSelectedPatient.name}
                  age={preSelectedPatient.age}
                  bloodType={preSelectedPatient.bloodType}
                  allergies={preSelectedPatient.allergies}
                />
                ) : (
                  <Typography color="error">No patient selected.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          
          {/* Appointment Section */}
          <Grid size={12}>
            <AppointmentSection
            preSelectedAppointment={preSelectedAppointment}
            watchedFollowUpRequired={watchedFollowUpRequired}
            watch={watch}
            formatDate={formatDate}
            ></AppointmentSection>
          </Grid>

          
          {/* Consultation Details */}
          <Grid size={12}>
            <ConsultationDetailsSection
              isReadOnly={isReadOnly}
              consultationRecord={consultationRecord}
              control={control}
              errors={errors}
            ></ConsultationDetailsSection>
          </Grid>

          {/* Prescriptions */}
          <Grid>
            <PrescriptionsSection
              isReadOnly={isReadOnly}
              consultationRecord={consultationRecord}
              fields={fields}
              control={control}
              errors={errors}
              addPrescription={addPrescription}
              removePrescription={removePrescription}
            />
          </Grid>

          {/* Follow-up */}
          {!isReadOnly && (
          <Grid size={2}>
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
                          InputProps={{ readOnly: isReadOnly }}
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
                              readOnly: isReadOnly,
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
          )}

          {/* Submit Button */}
          {!isReadOnly && (
          <Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/consultations-records')}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => navigate('/consultations-records')}
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
          )}
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