import * as yup from 'yup';

// Validation schema for consultation form
export const consultationValidationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  appointmentId: yup.string().required('Appointment is required'),
  symptoms: yup.string().required('Symptoms are required'),
  diagnosis: yup.string().required('Diagnosis is required').min(5, 'Please provide a detailed diagnosis'),
  notes: yup.string().required(),
  prescriptions: yup.array().of(
    yup.object({
      medication: yup.string().required('Medication name is required'),
      dosage: yup.string().required('Dosage is required'),
      frequency: yup.string().required('Frequency is required'),
      duration: yup.string().required('Duration is required'),
      instructions: yup.string().optional(),
    })
  ).required(),
  followUpRequired: yup.boolean().required('Follow-up is required'),
  followUpDate: yup.string().when('followUpRequired', {
    is: true,
    then: (schema) => schema.required('Follow-up date is required when follow-up is needed'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Validation schema for medical history entry
export const medicalHistoryValidationSchema = yup.object({
  type: yup.string().oneOf(['diagnosis', 'prescription', 'consultation', 'procedure']).required('Type is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  severity: yup.string().oneOf(['low', 'moderate', 'high', 'critical']).optional(),
  dosage: yup.string().optional(),
  symptoms: yup.array().of(yup.string()).optional(),
});

// Validation schema for prescription
export const prescriptionValidationSchema = yup.object({
  medication: yup.string().required('Medication name is required'),
  dosage: yup.string().required('Dosage is required'),
  frequency: yup.string().required('Frequency is required'),
  duration: yup.string().required('Duration is required'),
  instructions: yup.string().optional(),
});