import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, MenuItem, Autocomplete
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';


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
  onSubmit: (data: PatientFormValues) => void;
  isLoading?: boolean;
  initialValues?: Partial<PatientFormValues>;
  doctors: DoctorOption[];
  mode?: 'create' | 'edit' | 'view';
}

const schema = yup.object({
  name: yup.string().required('Patient name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  doctorId: yup.string().required('Doctor is required'),
  appointmentSlot: yup.string().required('Appointment slot is required'),
  reason: yup.string().required(),
});

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  initialValues = {},
  doctors,
  mode = 'create',
}) => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      doctorId: '',
      appointmentSlot: '',
      reason: '',
      ...initialValues,
    },
  });

  const selectedDoctorId = watch('doctorId');
  const selectedDoctor = doctors.find(d => d.value === selectedDoctorId);

  useEffect(() => {
    if (open) {
      reset({
      name: initialValues.name || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      doctorId: initialValues.doctorId || '',
      appointmentSlot: initialValues.appointmentSlot || '',
      reason: initialValues.reason || '',
      });
    }
  }, [open]);

  useEffect(() => {
  console.log('Initial values received:', initialValues);
}, [initialValues]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>        
        {mode === 'view'
          ? 'Patient Details'
          : mode === 'edit'
          ? 'Edit Appointment'
          : 'Register Patient & Schedule Appointment'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Patient Name"
              fullWidth
              disabled= {mode === 'view'}
              error= {!!errors.name && mode !== 'view'}
              helperText= {mode !== 'view' ? errors.name?.message: ''}
              /*required  => this triggers the browser’s native validation is triggered (showing the yellow 
              popup "Please fill in this field") before React Hook Form can handle it. */
              //error={!!errors.name}
              //helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              disabled= {mode === 'view'}
              error= {!!errors.email && mode !== 'view'}
              helperText= {mode !== 'view' ? errors.email?.message: ''}
              //required
              //error={!!errors.email}
              //helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Phone"
              fullWidth
              disabled= {mode === 'view'}
              error= {!!errors.phone && mode !== 'view'}
              helperText= {mode !== 'view' ? errors.phone?.message: ''}
              //required
              //error={!!errors.phone}
              //helperText={errors.phone?.message}
              {...register('phone')}
            />
            {/* Doctor selection */}
            <Controller
              name="doctorId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={doctors}
                  getOptionLabel={option => option.label}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  value={doctors.find(d => d.value === field.value) || null}
                  onChange={(_, val) => field.onChange(val?.value ?? '')}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Doctor"
                      disabled= {mode === 'view'}
                      error= {!!errors.doctorId && mode !== 'view'}
                      helperText= {mode !== 'view' ? errors.doctorId?.message: ''}
                      //required
                      //error={!!errors.doctorId}
                      //helperText={errors.doctorId?.message}
                    />
                  )}
                />
              )}
            />
            {/* Appointment slot selection */}
            <Controller
              name="appointmentSlot"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Appointment Slot"
                  fullWidth
                  //required
                  disabled={mode === 'view' || !selectedDoctor}
                  error={!!errors.appointmentSlot || mode === 'view'}
                  helperText={
                    mode === 'view' ?(
                    !selectedDoctor
                      ? 'Select a doctor to see available slots'
                      : errors.appointmentSlot?.message
                    ) : ''
                  }
                  {...field}
                >
                    {selectedDoctor?.availableSlots.length
                        ? selectedDoctor.availableSlots.map(slot => (
                            <MenuItem key={slot} value={slot}>
                            {new Date(slot).toLocaleString()}
                            </MenuItem>
                        ))
                        : (
                            <MenuItem value="" disabled>
                            {selectedDoctor ? 'No slots available' : 'Select a doctor first'}
                            </MenuItem>
                        )
                    }
                </TextField>
              )}
            />
            <TextField
              label="Reason for Visit"
              fullWidth
              multiline
              rows={2}
              disabled= {mode === 'view'}
              {...register('reason')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Close</Button>
          {/*<Button type="submit" variant="contained" disabled={isLoading}>
            Register & Schedule
          </Button>*/}
           {mode !== 'view' && (
            <Button type="submit" variant="contained">
              {mode === 'edit' ? 'Update' : 'Register & Schedule'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PatientFormModal;