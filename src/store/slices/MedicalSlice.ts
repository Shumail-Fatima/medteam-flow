// Redux slice for managing medical data (consultations, medical history)
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Consultation } from '../../types/medical';
import { ENDPOINTS } from '../../constants/apiConstants';
import { apiClient } from '../../utils/apiClient';

const API_PATH = ENDPOINTS.CONSULTATIONS;

interface MedicalState {
  consultations: Consultation[];
  //extendedPatients: ExtendedPatient[];
  loading: boolean;
  error: string | null;
}

// Async GET request
export const fetchConsultations = createAsyncThunk('consultations/fetchConsultations', async () => {
  const data = await apiClient.get<unknown>(API_PATH);
  return Array.isArray(data) ? data : (data as any).consultations ?? (data as any).Consultations ?? [];
});

// Async POST request
export const addConsultationAsync = createAsyncThunk(
  'consultations/addConsultationAsync',
  async (newConsultation: Consultation) => {
    return await apiClient.post<Consultation, Consultation>(API_PATH, newConsultation);
  }
);

// Async PUT request
export const updateConsultationAsync = createAsyncThunk(
 'consultations/updateConsultation',
  async (consultation: Consultation) => {
    const response = await apiClient.put<Consultation, Consultation>(`${API_PATH}/${consultation.id}`, consultation);
    return response;
  }
);

//Async DELETE request
export const  deleteConsultationAsync = createAsyncThunk(
  'consultations/deleteConsultation',
  async (consultationId: string) => {
    await apiClient.delete<void>(`${API_PATH}/${consultationId}`);
    return consultationId as unknown as Consultation; // keep reducer shape below but we will adjust
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

// Initial state with medical data loaded from JSON
const initialState: MedicalState = {
  consultations:  [] as Consultation[],
  loading: false,
  error: null,
};

// Create medical slice with reducers for medical data management
const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    // Add a new consultation record
    addConsultation: (state, action: PayloadAction<Consultation>) => {
      state.consultations.push(action.payload);
    },
    
    // Update an existing consultation
    updateConsultation: (state, action: PayloadAction<Consultation>) => {
      const index = state.consultations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.consultations[index] = action.payload;
      }
    },
    
    // Get consultations by doctor ID
    getConsultationsByDoctor: (state, action: PayloadAction<string>) => {
      // This is handled by selectors, but we can add filtering logic here if needed
    },
    
    // Get consultations by patient ID
    getConsultationsByPatient: (state, action: PayloadAction<string>) => {
      // This is handled by selectors, but we can add filtering logic here if needed
    },
    
    // Set loading state for async operations
    setMedicalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error message for medical operations
    setMedicalError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        const consultation = action.payload;
        state.consultations.push(consultation);
      })

      .addCase(updateConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        const updated = action.payload;
        const index = state.consultations.findIndex(c => c.id === updated.id);
        if (index !== -1) {
          state.consultations[index] = updated;
        }

        // Optionally: update the medical history if consultation changes
        // Not required unless you're showing/editing past notes/diagnosis
      })

      .addCase(fetchConsultations.fulfilled, (state, action: PayloadAction<Consultation[]>) => {
        state.consultations = action.payload;
      })

      .addCase(deleteConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        state.consultations = state.consultations.filter(c => c.id !== action.payload.id);
      });
  }
});

// Export actions for use in components
export const {
  addConsultation,
  updateConsultation,
  // addMedicalHistoryEntry,
  // updatePatientMedicalInfo,
  getConsultationsByDoctor,
  getConsultationsByPatient,
  setMedicalLoading,
  setMedicalError,
} = medicalSlice.actions;

// Export reducer for store configuration
export default medicalSlice.reducer;