// Redux store configuration using Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from './slices/AppointmentSlice'
import patientReducer from './slices/PatientSlice'
import userReducer from './slices/UserSlice'
import taskReducer from './slices/TaskSlice'
import settingsReducer from './slices/SettingsSlice';
import supportReducer from './slices/SupportSlice';
import doctorReducer from './slices/DoctorSlice';
import medicalReducer from './slices/MedicalSlice';
import notificationReducer from './slices/NotificationSlice';

// Configure the Redux store with appointment and patient slices
export const store = configureStore({
  reducer: {
    appointments: appointmentReducer,
    patients: patientReducer,
    user: userReducer,
    task: taskReducer,
    settings: settingsReducer,
    support: supportReducer,
    doctors: doctorReducer,
    medical: medicalReducer,
    notifications: notificationReducer,
  },
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;