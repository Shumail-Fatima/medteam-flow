// Redux store configuration using Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from './slices/AppointmentSlice'
import patientReducer from './slices/PatientSlice'
import userReducer from './slices/UserSlice'

// Configure the Redux store with appointment and patient slices
export const store = configureStore({
  reducer: {
    appointments: appointmentReducer,
    patients: patientReducer,
    user: userReducer,
  },
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;