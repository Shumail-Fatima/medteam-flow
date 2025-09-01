// Redux slice for managing appointment state
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Appointment } from '../../types/appointment';
import { ENDPOINTS } from '../../constants/apiConstants';
import { apiClient } from '../../utils/apiClient';

const API_PATH = ENDPOINTS.APPOINTMENTS;

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async () => {
  const data = await apiClient.get<unknown>(API_PATH);
  return Array.isArray(data) ? data : (data as any).appointments ?? (data as any).Appointments ?? [];
});

export const addAppointmentAsync = createAsyncThunk(
  'appointments/addAppointmentAsync',
  async (newAppointment: Appointment) => {
    return await apiClient.post<Appointment, Appointment>(API_PATH, newAppointment);
  }
);

export const updateAppointmentAsync = createAsyncThunk(
  'appointments/updateAppointment',
  async (appointment: Appointment) => {
    const response = await apiClient.put<Appointment, Appointment>(`${API_PATH}/${appointment.id}`, appointment);
    return response;
  }
);

export const deleteAppointmentAsync = createAsyncThunk(
  'appointments/deleteAppointment',
  async (appointmentId: string) => {
    await apiClient.delete<void>(`${API_PATH}/${appointmentId}`);
    return appointmentId as unknown as Appointment; // keep reducer shape below but we will adjust
  }
);

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
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
        state.appointments = action.payload;
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
      .addCase(updateAppointmentAsync.fulfilled, (state, action: PayloadAction<Appointment>) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(deleteAppointmentAsync.fulfilled, (state, action: PayloadAction<any>) => {
        const id = typeof action.payload === 'string' ? action.payload : action.payload?.id;
        if (id) {
          state.appointments = state.appointments.filter(apt => apt.id !== id);
        }
      });
  },
});

export const { 
  addAppointment, 
  updateAppointment, 
  deleteAppointment, 
  setLoading, 
  setError 
} = appointmentSlice.actions;

export default appointmentSlice.reducer;