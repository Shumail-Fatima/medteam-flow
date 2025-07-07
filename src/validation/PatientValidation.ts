import * as yup from 'yup';

export const patientSchema = yup.object({
    name: yup.string().required('Patient name is required').min(2, 'Name must be at least 2 characters'),
    dateOfBirth:yup.string().required('Date of birth is required'),
    email:yup.string().email('Invalid email').required('Email is required'),
    phone:yup.string().required('Phone number is required'),
  });
  