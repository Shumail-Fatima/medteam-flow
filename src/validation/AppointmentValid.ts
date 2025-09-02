import * as yup from 'yup';
import type { AppointmentFormData, AppointmentStatus } from '../types/appointment';

export const appointmentValidationSchema: yup.ObjectSchema<AppointmentFormData> = yup.object({
    specialtyId: yup.string().optional(),
    patientId: yup.string().required('Patient is required'),
    doctorId: yup.string().required('Doctor is required'),
    appointmentSlot: yup.string().required('Appointment slot is required'),
    reason: yup.string().optional(),
    status: yup.mixed<AppointmentStatus>().required()
});