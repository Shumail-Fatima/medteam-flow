import * as yup from 'yup';
import type { PatientFormData } from '../types/medical';

export const patientSchema = yup.object({
    name: yup.string().required('Patient name is required').min(2, 'Name must be at least 2 characters'),
    dateOfBirth:yup.string().required('Date of birth is required'),
    email:yup.string().email('Invalid email').required('Email is required'),
    phone:yup.string().required('Phone number is required'),
    address: yup.string().required(),
    emergencyContact: yup.array().of(
      yup.object({
        name: yup.string().required(),
        phone: yup.string().required(),
        relationship: yup.string().required(),
      })
    ).required(),
    allergies: yup
      .array()
      .of(yup.string().trim().min(1).required())
      .required('At least one allergy or empty list'),
    bloodType: yup.string().notRequired(),
    createdAt: yup.string().notRequired(),
  }) as yup.ObjectSchema<PatientFormData>;
  