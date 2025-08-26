// Redux slice for managing user state
import { createSlice, type PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import type { User } from '../../types/Auth';
import rolesData from '../../../mockServer/MockData.json'

const API_URL = 'http://localhost:8000/users'; // Your REST API endpoint


interface UserState{
    users: User[];
    loading: boolean;
    error: string | null;
}


// Async GET request
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const res = await fetch(API_URL);
  return await res.json();
});

// Async POST request
export const addUserAsync = createAsyncThunk(
  'users/addUserAsync',
  async (newUser: User) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    return await res.json();
  }
);

const initialState: UserState = {
  users: [], // start with empty array
  loading: false,
  error: null
};

// userSlice.ts
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (user: User) => {
    const response = await fetch(`${API_URL}/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  }
);

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (user: User) => {
    const response = await fetch(`${API_URL}/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return await response.json();
  }
);



// Initial state with users loaded from JSON data
// const initialState: UserState = {
//     users: usersData.map((user: any) => ({
//     ...user,
//     id: String(user.id), // convert number to string if needed
//     roleName: rolesData.find((r) => r.id === user.roleId)?.name || 'unknown',
//     createdAt: user.createdAt ?? new Date().toISOString(),
//   })),
//     loading: false,
//     error: null,
// }

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