// Redux slice for managing user state
import { createSlice, type PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import type { Task } from '../../types/task';
import tasksData from '../../../mockServer/MockData.json'


const API_URL = 'http://localhost:8000/Tasks'; // Your REST API endpoint

interface TaskState{
    tasks:Task[];
    loading: boolean;
    error: string | null;
}


// Async GET request
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const res = await fetch(API_URL);
  return await res.json();
});

// Async POST request
export const addTaskAsync = createAsyncThunk(
  'tasks/addTaskAsync',
  async (newTask: Task) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    return await res.json();
  }
);


// const initialState: TaskState = {
//     tasks: tasksData.tasks.map(task => ({
//     ...task,
//     assigneeId: String(task.assigneeId),
//     createdBy: String(task.createdBy),
//     createdAt: task.createdAt ?? new Date().toISOString()
//   })) as Task[],
//     loading: false,
//     error: null,
// }

const initialState: TaskState = {
  tasks: [], // start with empty array
  loading: false,
  error: null
};


export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async (task: Task) => {
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return await response.json();
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    return await response.json();
  }
);


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
         // Update task status
        updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: Task['status'] }>) => {
        const task = state.tasks.find(task => task.id === action.payload.taskId);
        if (task) {
            task.status = action.payload.status;
      }
    },
    },
        extraReducers: (builder) => {
        builder
          .addCase(fetchTasks.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.tasks = action.payload.map((task) => ({
                    ...task,
                    assigneeName: tasksData.Tasks.find((u) => u.id === task.assigneeId)?.title || 'unknown',
                }));
                state.loading = false;
                })
        .addCase(fetchTasks.rejected, (state, action) => {
            state.error = action.error.message || 'Failed to fetch tasks';
            state.loading = false;
        })
        .addCase(addTaskAsync.fulfilled, (state, action) => {
            const task = action.payload;
            const assigneeName = tasksData.Tasks.find(u => u.id === task.assigneeId)?.title || 'unknown';
            state.tasks.push({ ...task, assigneeName });
            })
        builder.addCase(updateTaskAsync.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
            state.tasks[index] = action.payload;
        }
        })
        .addCase(deleteTaskAsync.fulfilled, (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        });
    ;
    
      },
});

export const {
    addTask,
    updateTask,
    deleteTask,
    setLoading,
    setError,
    updateTaskStatus,
} = taskSlice.actions;

export default taskSlice.reducer;