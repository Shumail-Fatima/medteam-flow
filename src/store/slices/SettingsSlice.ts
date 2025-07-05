// Redux slice for managing user settings state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserSettings } from '../../types/settings';
import settingsData from '../../data/Settings.json';

interface SettingsState {
  userSettings: UserSettings[];
  currentUserSettings: UserSettings | null;
  loading: boolean;
  error: string | null;
}

// Initial state with settings loaded from JSON data
const initialState: SettingsState = {
  userSettings: settingsData as UserSettings[],
  currentUserSettings: null,
  loading: false,
  error: null,
};

// Create settings slice with reducers for settings management
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Set current user's settings based on user ID
    setCurrentUserSettings: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.currentUserSettings = state.userSettings.find(
        settings => settings.userId === userId
      ) || null;
    },
    
    // Update user settings - either update existing or create new
    updateUserSettings: (state, action: PayloadAction<UserSettings>) => {
      const updatedSettings = action.payload;
      const index = state.userSettings.findIndex(
        settings => settings.userId === updatedSettings.userId
      );
      
      if (index !== -1) {
        // Update existing settings
        state.userSettings[index] = updatedSettings;
      } else {
        // Create new settings for user
        state.userSettings.push(updatedSettings);
      }
      
      // Update current user settings if it's the same user
      if (state.currentUserSettings?.userId === updatedSettings.userId) {
        state.currentUserSettings = updatedSettings;
      }
    },
    
    // Reset settings to default values for a user
    resetUserSettings: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const defaultSettings: UserSettings = {
        id: `settings_${Date.now()}`,
        userId,
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        systemAlerts: true,
        autoLogout: 30,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        updatedAt: new Date().toISOString(),
      };
      
      const index = state.userSettings.findIndex(
        settings => settings.userId === userId
      );
      
      if (index !== -1) {
        state.userSettings[index] = defaultSettings;
      } else {
        state.userSettings.push(defaultSettings);
      }
      
      if (state.currentUserSettings?.userId === userId) {
        state.currentUserSettings = defaultSettings;
      }
    },
    
    // Set loading state for async operations
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error message for settings operations
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions for use in components
export const {
  setCurrentUserSettings,
  updateUserSettings,
  resetUserSettings,
  setSettingsLoading,
  setSettingsError,
} = settingsSlice.actions;

// Export reducer for store configuration
export default settingsSlice.reducer;