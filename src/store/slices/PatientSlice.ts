// Redux slice for managing patient state
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient } from '../../types/medical';
import type { ExtendedPatient } from '../../types/medical';
import patientsData from '../../../mockServer/MockData.json';

const API_URL = 'http://localhost:8000/patients'; // FastAPI endpoint

interface PatientState {
  // patients: Patient[];
  patients: ExtendedPatient[];
  loading: boolean;
  error: string | null;
}

export const fetchPatients = createAsyncThunk('patients/fetchPatients', async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.patients ?? data.Patients ?? []);
});

export const addPatientAsync = createAsyncThunk(
  'patients/addPatient',
  async (patient: Patient) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });


    if (!res.ok) {
      throw new Error('Failed to create patient');
    }
    return await res.json();
  }
);

export const updatePatientAsync = createAsyncThunk(
  'patients/updatePatient',
  async (patient: Patient) => {
    const res = await fetch(`${API_URL}/${patient.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });
    if (!res.ok) {
      throw new Error('Failed to update patient');
    }


    
    return await res.json();
  }
);

export const deletePatientAsync = createAsyncThunk(
  'patients/deletePatient',
  async (patientId: string) => {
    const res = await fetch(`${API_URL}/${patientId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error('Failed to delete patient');
    }
    // Backend returns 204 No Content
    return patientId;
  }
);

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
  patients: patientsData.Patients.map(patient => ({
    ...patient,
    age: calculateAge(patient.dateOfBirth),
    // Normalize emergencyContact to object if array with one element exists
    emergencyContact: Array.isArray((patient as any).emergencyContact)
      ? ((patient as any).emergencyContact[0] ?? undefined)
      : (patient as any).emergencyContact,
  })) as ExtendedPatient[],
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
      // const patientWithAge = {
      //   ...action.payload,
      //   age: calculateAge(action.payload.dateOfBirth)
      // };
      const normalizedEmergency = Array.isArray(action.payload.emergencyContact)
        ? action.payload.emergencyContact[0]
        : (action.payload as any).emergencyContact;
      const patientWithAge: ExtendedPatient = {
        ...action.payload,
        emergencyContact: normalizedEmergency as any,
        age: calculateAge(action.payload.dateOfBirth),
        medicalHistory: [],
        allergies: action.payload.allergies ?? [],
        createdAt: new Date().toISOString(),
      } as any;
      state.patients.push(patientWithAge);
    },
    // Update an existing patient by ID
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const index = state.patients.findIndex(patient => patient.id === action.payload.id);
      if (index !== -1) {
        const normalizedEmergency = Array.isArray(action.payload.emergencyContact)
          ? action.payload.emergencyContact[0]
          : (action.payload as any).emergencyContact;
        const patientWithAge: ExtendedPatient = {
          ...action.payload,
          emergencyContact: normalizedEmergency as any,
          age: calculateAge(action.payload.dateOfBirth),
          medicalHistory: state.patients[index].medicalHistory ?? [],
          allergies: action.payload.allergies ?? state.patients[index].allergies ?? [],
          createdAt: state.patients[index].createdAt ?? new Date().toISOString(),
        } as any;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action: PayloadAction<Patient[]>) => {
        state.patients = action.payload.map(patient => ({
          ...patient,
          emergencyContact: Array.isArray((patient as any).emergencyContact)
            ? ((patient as any).emergencyContact[0] ?? undefined)
            : (patient as any).emergencyContact,
          age: calculateAge(patient.dateOfBirth),
          medicalHistory: [],
          allergies: (patient as any).allergies ?? [],
          createdAt: (patient as any).createdAt ?? new Date().toISOString(),
        })) as any;
        state.loading = false;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patients';
      });
    builder
      .addCase(addPatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })



      .addCase(addPatientAsync.fulfilled, (state, action: PayloadAction<Patient>) => {
        const patient = action.payload as any;
        const normalizedEmergency = Array.isArray(patient.emergencyContact)
          ? patient.emergencyContact[0]
          : patient.emergencyContact;
        state.patients.push({
          ...patient,
          emergencyContact: normalizedEmergency,
          age: calculateAge(patient.dateOfBirth),
          medicalHistory: patient.medicalHistory ?? [],
          allergies: patient.allergies ?? [],
          createdAt: patient.createdAt ?? new Date().toISOString(),
        } as any);
        state.loading = false;
      })
      .addCase(addPatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add patient';
      })
      .addCase(updatePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientAsync.fulfilled, (state, action: PayloadAction<Patient>) => {
        const idx = state.patients.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          const p = action.payload as any;
          const normalizedEmergency = Array.isArray(p.emergencyContact) ? p.emergencyContact[0] : p.emergencyContact;
          state.patients[idx] = {
            ...p,
            emergencyContact: normalizedEmergency,
            age: calculateAge(p.dateOfBirth),
            medicalHistory: p.medicalHistory ?? state.patients[idx].medicalHistory ?? [],
            allergies: p.allergies ?? state.patients[idx].allergies ?? [],
            createdAt: state.patients[idx].createdAt ?? new Date().toISOString(),
          } as any;
        }
        state.loading = false;
      })
      .addCase(updatePatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update patient';
      })
      .addCase(deletePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatientAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.patients = state.patients.filter(p => p.id !== action.payload);
        state.loading = false;
      })
      .addCase(deletePatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete patient';
      });



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