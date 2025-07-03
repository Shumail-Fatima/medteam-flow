// Redux slice for managing user state
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../../types/task';
import tasksData from '../../data/Tasks.json'

interface TaskState{
    tasks:Task[];
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: tasksData.tasks.map(task => ({
    ...task,
    assigneeId: String(task.assigneeId),
    createdBy: String(task.createdBy),
    createdAt: task.createdAt ?? new Date().toISOString()
  })) as Task[],
    loading: false,
    error: null,
}

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1){
                state.tasks[index] = action.payload;
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    addTask,
    updateTask,
    deleteTask,
    setLoading,
    setError
} = taskSlice.actions;

export default taskSlice.reducer;