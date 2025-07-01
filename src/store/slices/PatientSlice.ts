// Redux slice for managing patient state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient } from '../../types/appointment';
import patientsData from '../../data/Patients.json';

interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Initial state with patients loaded from JSON data and age calculated
const initialState: PatientState = {
  patients: patientsData.map(patient => ({
    ...patient,
    age: calculateAge(patient.dateOfBirth)
  })) as Patient[],
  loading: false,
  error: null,
};

// Create patient slice with reducers for CRUD operations
const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    // Add a new patient to the state
    addPatient: (state, action: PayloadAction<Patient>) => {
      const patientWithAge = {
        ...action.payload,
        age: calculateAge(action.payload.dateOfBirth)
      };
      state.patients.push(patientWithAge);
    },
    // Update an existing patient by ID
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const index = state.patients.findIndex(patient => patient.id === action.payload.id);
      if (index !== -1) {
        const patientWithAge = {
          ...action.payload,
          age: calculateAge(action.payload.dateOfBirth)
        };
        state.patients[index] = patientWithAge;
      }
    },
    // Remove a patient by ID
    deletePatient: (state, action: PayloadAction<string>) => {
      state.patients = state.patients.filter(patient => patient.id !== action.payload);
    },
    // Set loading state for async operations
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions for use in components
export const { 
  addPatient, 
  updatePatient, 
  deletePatient, 
  setLoading, 
  setError 
} = patientSlice.actions;

// Export reducer for store configuration
export default patientSlice.reducer;