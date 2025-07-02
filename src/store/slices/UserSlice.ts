// Redux slice for managing user state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import usersData from '../../data/Users.json'
import type { User } from '../../types/Auth';
import rolesData from '../../data/Roles.json'

interface UserState{
    users: User[];
    loading: boolean;
    error: string | null;
}

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

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers:{
        addUser: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
        },
        updateUser: (state, action: PayloadAction<User>) => {
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1){
                state.users[index] = action.payload;
            }
        },
        deleteUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(u => u.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const{
    addUser,
    updateUser,
    deleteUser,
    setLoading,
    setError
} = userSlice.actions;

export default userSlice.reducer;