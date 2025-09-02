// Redux slice for managing doctor specialties and filtering
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DoctorSpecialty } from '../../types/appointment';
import doctorSpecialtiesData from '../../../mockServer/data/DoctorSpeciality.json';
//import doctorSpecialtiesData from '../../../mockServer/MockData.json';

interface DoctorState {
  specialties: DoctorSpecialty[];
  selectedSpecialtyId: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state with doctor specialties loaded from JSON data
const initialState: DoctorState = {
  //specialties: doctorSpecialtiesData as DoctorSpecialty[],
  specialties: doctorSpecialtiesData.DoctorSpecialties as DoctorSpecialty[],
  selectedSpecialtyId: null,
  loading: false,
  error: null,
};

// Create doctor slice with reducers for specialty management
const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    // Set the selected specialty for filtering doctors
    setSelectedSpecialty: (state, action: PayloadAction<string | null>) => {
      state.selectedSpecialtyId = action.payload;
    },
    
    // Clear specialty filter to show all doctors
    clearSpecialtyFilter: (state) => {
      state.selectedSpecialtyId = null;
    },
    
    // Set loading state for async operations
    setDoctorLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error message for doctor operations
    setDoctorError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions for use in components
export const {
  setSelectedSpecialty,
  clearSpecialtyFilter,
  setDoctorLoading,
  setDoctorError,
} = doctorSlice.actions;

// Export reducer for store configuration
export default doctorSlice.reducer;