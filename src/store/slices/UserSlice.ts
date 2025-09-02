// Redux slice for managing user state
import { createSlice, type PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import type { User } from '../../types/Auth';
import rolesData from '../../../mockServer/data/Roles.json'
import { ENDPOINTS } from '../../constants/apiConstants';
import { apiClient } from '../../utils/apiClient';

const API_PATH = ENDPOINTS.USERS;
interface UserState{
    users: User[];
    loading: boolean;
    error: string | null;
}

// Async GET request
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const data = await apiClient.get<unknown>(API_PATH);
  return Array.isArray(data) ? data : (data as any).users ?? (data as any).User ?? [];
});

// Async POST request
export const addUserAsync = createAsyncThunk(
  'users/addUserAsync',
  async (newUser: User) => {
    return await apiClient.post<User, User>(API_PATH, newUser);
  }
);

const initialState: UserState = {
  users: [], // start with empty array
  loading: false,
  error: null
};

// Async PUT request
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (user: User) => {
    const response = await apiClient.put<User, User>(`${API_PATH}/${user.id}`, user);
    return response;
  }
);

// Async DELETE request
export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (user: User) => {
    // await apiClient.delete<void>(`${API_PATH}/${user.id}`);
    // return user; // Return the user object for the reducer
    await apiClient.delete<void>(`${API_PATH}/${user.id}`);
    return user as unknown as User; // keep reducer shape below but we will adjust
  }
);

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
    extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
            state.users = action.payload.map((user) => ({
                ...user,
                roleName: rolesData.Roles.find((r) => r.id === String(user.roleId))?.name || 'unknown',
            }));
            state.loading = false;
            })
    .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch users';
        state.loading = false;
    })
    .addCase(addUserAsync.fulfilled, (state, action) => {
        const user = action.payload;
        const roleName = rolesData.Roles.find(r => r.id === String(user.roleId))?.name || 'unknown';
        state.users.push({ ...user, roleName });
        })
    builder.addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
    const index = state.users.findIndex(u => u.id === action.payload.id);
    if (index !== -1) {
        state.users[index] = action.payload;
    }
    })
    .addCase(deleteUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.filter(u => u.id !== action.payload.id);
    });
  },
});

// Export actions for use in components
export const {
    addUser,
    updateUser,
    deleteUser,
    setLoading,
    setError,
} = userSlice.actions;

// Export reducer for store configuration
export default userSlice.reducer;