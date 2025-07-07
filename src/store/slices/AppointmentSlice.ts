// Redux slice for managing appointment state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Appointment } from '../../types/appointment';
import appointmentsData from '../../data/Appointments.json';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

// Initial state with appointments loaded from JSON data
const initialState: AppointmentState = {
  appointments: appointmentsData as Appointment[],
  loading: false,
  error: null,
};

// Create appointment slice with reducers for CRUD operations
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Add a new appointment to the state
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    // Update an existing appointment by ID
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    // Remove an appointment by ID
    deleteAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
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
  addAppointment, 
  updateAppointment, 
  deleteAppointment, 
  setLoading, 
  setError 
} = appointmentSlice.actions;

// Export reducer for store configuration
export default appointmentSlice.reducer;