// Redux slice for managing appointment state
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Appointment } from '../../types/appointment';
import appointmentsData from '../../../mockServer/data/Appointments.json';

const API_URL = 'http://localhost:8000/Appointments'; // Your REST API endpoint

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}



// Async GET request
export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async () => {
  const res = await fetch(API_URL);
  return await res.json();
});

// Async POST request
export const addAppointmentAsync = createAsyncThunk(
  'appointments/addAppointmentAsync',
  async (newAppointment: Appointment) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointment),
    });
    return await res.json();
  }
);

// userSlice.ts
export const updateAppointmentAsync = createAsyncThunk(
  'appointments/updateAppointment',
  async (appointment: Appointment) => {
    const response = await fetch(`${API_URL}/${appointment.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment');
    }

    return await response.json();
  }
);

export const deleteAppointmentAsync = createAsyncThunk(
  'appointments/deleteAppointment',
  async (appointmentId: string) => {
    const response = await fetch(`${API_URL}/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete appointment');
    }

    return await response.json();
  }
);



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
    extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
            state.appointments = action.payload.map((appointment) => ({
                ...appointment,
            }));
            state.loading = false;
            })
    .addCase(fetchAppointments.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch appointments';
        state.loading = false;
    })
    .addCase(addAppointmentAsync.fulfilled, (state, action) => {
        const appointment = action.payload;
        state.appointments.push(appointment);
        })
    builder.addCase(updateAppointmentAsync.fulfilled, (state, action: PayloadAction<Appointment>) => {
    const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
    if (index !== -1) {
        state.appointments[index] = action.payload;
    }
    })
    .addCase(deleteAppointmentAsync.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.appointments = state.appointments.filter(apt => apt.id !== action.payload.id);
    });
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