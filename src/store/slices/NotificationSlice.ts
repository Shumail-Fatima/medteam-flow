// NotificationSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../context/NotifSocketContext';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload); // Add to beginning
    },
    
    // Mark notification as read
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    
    // Mark all notifications as read
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.isRead = true);
    },
    
    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    // Set notifications (for initial load)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    
    // Set loading state
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setNotificationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  setNotifications,
  setNotificationLoading,
  setNotificationError,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
