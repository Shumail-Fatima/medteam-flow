import * as yup from 'yup';

export const userSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    roleId: yup.number().required('Role is required'),
    specialtyId: yup.string().when('roleId', {
    is: 2, // 2 = doctor
    then: (schema) => schema.required('Specialty is required for doctors'),
    otherwise: (schema) => schema.notRequired(),
  }),
  });