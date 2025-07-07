import * as yup from 'yup';
import type { TaskFormValues, TaskType, TaskStatus } from '../types/task';

// -------- validation --------
export const schema: yup.ObjectSchema<Omit<TaskFormValues, 'id'>> = yup.object({
    title: yup.string().required(),
    type: yup.mixed<TaskType>().required(),
    patientId: yup.string().required(),
    assigneeId: yup.string().required(),
    dueAt: yup.string().required(),
    status: yup.mixed<TaskStatus>().required(),
    notes: yup.string().required(),
  });
  