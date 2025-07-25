// Redux slice for managing user state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import usersData from '../../../mockServer/data/Users.json'
import type { User } from '../../types/Auth';
import rolesData from '../../../mockServer/data/Roles.json'

interface UserState{
    users: User[];
    loading: boolean;
    error: string | null;
}

// Initial state with users loaded from JSON data
const initialState: UserState = {
    users: usersData.map((user: any) => ({
    ...user,
    id: String(user.id), // convert number to string if needed
    roleName: rolesData.find((r) => r.id === user.roleId)?.name || 'unknown',
    createdAt: user.createdAt ?? new Date().toISOString(),
  })),
    loading: false,
    error: null,
}

// Create user slice with reducers for CRUD operations
const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers:{
        // Add a new appointment to the state
        addUser: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
        },
        // Update an existing appointment by ID
        updateUser: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1){
                state.users[index] = action.payload;
            }
        },
        // Remove an appointment by ID
        deleteUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(u => u.id !== action.payload);
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
export const{
    addUser,
    updateUser,
    deleteUser,
    setLoading,
    setError
} = userSlice.actions;

// Export reducer for store configuration
export default userSlice.reducer;