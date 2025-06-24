// src/components/TaskFormModal.tsx
import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, InputLabel, MenuItem,
  FormControl, Select, Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// -------- import dummy data --------
import data from '../data/dummy-data.json';

// -------- types --------
type Role = 'admin' | 'doctor' | 'nurse';
type TaskStatus = 'Pending' | 'In Progress' | 'Done';
type TaskType =
  | 'Medication'
  | 'Vitals Check'
  | 'Procedure Prep'
  | 'Consultation Follow-up';

interface TaskFormValues {
  id: string;
  title: string;
  type: TaskType;
  patientId: string;
  assigneeId: string;
  dueAt: string; // updated to string instead of Date
  status: TaskStatus;
  notes: string;
}

interface Option {
  label: string;
  value: string;
}

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  role: Role;
  taskId?: string;
  onClose: () => void;
  //onSave: (task: TaskFormValues) => void;
  onDelete?: (taskId: string) => void;
  onSubmit: (task: TaskFormValues) => void;
}

/* ---- utility: convert dummy JSON to dropdown-friendly arrays ---- */
const patients: Option[] = data.patients.map(p => ({
  label: p.name,
  value: p.id,
}));

const staff: Option[] = data.users.map(u => ({
  label: u.name,
  value: u.id,
}));



// -------- validation --------
const schema: yup.ObjectSchema<Omit<TaskFormValues, 'id'>> = yup.object({
  title: yup.string().required(),
  type: yup.mixed<TaskType>().required(),
  patientId: yup.string().required(),
  assigneeId: yup.string().required(),
  dueAt: yup.string().required(),
  status: yup.mixed<TaskStatus>().required(),
  notes: yup.string().required(),
});

const TaskFormModal: React.FC<Props> = ({
  open,
  mode,
  role,
  taskId,
  onClose,
  //onSave,
  onDelete,
  onSubmit,
}) => {
  /* find existing task if editing */
  const existing = mode === 'edit'
    ? (data.tasks as any[]).find(t => t.id === taskId)
    : undefined;

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<Omit<TaskFormValues, 'id'>>({
    resolver: yupResolver(schema),
    defaultValues: existing ?? {
      //id: '', // <-- Add this line to avoid uncontrolled state
      title: '',
      type: 'Medication', // default type
      patientId: '',
      assigneeId: '',
      dueAt: new Date().toISOString().slice(0, 16), // default ISO string for datetime-local input
      status: 'Pending',
      notes: '',
    },
  });

  /* keep form in sync when taskId changes */
  useEffect(() => {
    if (mode === 'edit' && existing) {
    reset({
      ...existing,
      type: existing.type ?? 'Medication',
      status: existing.status ?? 'Pending',
      dueAt: new Date(existing.dueAt).toISOString().slice(0, 16),
    });
  } else if (mode === 'create') {
    reset({
      //id: '',
      title: '',
      type: 'Medication',
      patientId: '',
      assigneeId: '',
      dueAt: new Date().toISOString().slice(0, 16),
      status: 'Pending',
      notes: '',
    });
  }
}, [existing, mode, reset]);

  /* simple permission check */
  const isNurse = role === 'nurse';
  const disableField = {
    type: isNurse,
    patient: isNurse,
    assignee: isNurse,
  };

  const submit = (vals: Omit<TaskFormValues, 'id'>) => {
    const task: TaskFormValues = {
      ...vals,
      id: mode === 'create' ? `task_${Date.now()}` : taskId ?? '',
    };
    onSubmit(task);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'New Task' : 'Edit Task'}</DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Task Title"
            fullWidth
            required
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register('title')}
          />
        <Controller
            name="type"
            control={control}
            render={({ field }) => (
          <FormControl fullWidth disabled={disableField.type}>
            <InputLabel>Task Type</InputLabel>
            <Select label="Task Type"
                value={field.value ?? ''} // ✅ Ensure it never becomes undefined
                onChange={field.onChange}>
              <MenuItem value="Medication">Medication</MenuItem>
              <MenuItem value="Vitals Check">Vitals Check</MenuItem>
              <MenuItem value="Procedure Prep">Procedure Prep</MenuItem>
              <MenuItem value="Consultation Follow-up">Consultation Follow-up</MenuItem>
            </Select>
          </FormControl>
          )}
        />
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={patients}
                disabled={disableField.patient}
                isOptionEqualToValue={(o, v) => o.value === v.value}
                value={patients.find(p => p.value === field.value) || null}
                onChange={(_, val) => field.onChange(val?.value ?? '')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Patient"
                    required
                    error={!!errors.patientId}
                    helperText={errors.patientId?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={staff}
                disabled={disableField.assignee}
                isOptionEqualToValue={(o, v) => o.value === v.value}
                value={staff.find(s => s.value === field.value) || null}
                onChange={(_, val) => field.onChange(val?.value ?? '')}
                renderInput={params => (
                  <TextField {...params} label="Assignee" required />
                )}
              />
            )}
          />

          {/* ✅ Native datetime input */}
          <TextField
            label="Due Date & Time"
            type="datetime-local"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.dueAt}
            helperText={errors.dueAt?.message}
            {...register('dueAt')}
          />

            <Controller
            name="status"
            control={control}
            render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                    label="Status"
                    value={field.value ?? ''}  // Fallback to '' to avoid undefined
                    onChange={field.onChange}
                >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Done">Done</MenuItem>
                </Select>
                </FormControl>
            )}
            />
            
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            {...register('notes')}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        {mode === 'edit' && role !== 'nurse' && onDelete && taskId && (
          <Button color="error" onClick={() => onDelete(taskId)}>
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(submit)}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormModal;
