export interface Task {
  id: string;
  title: string;
  type: 'Medication' | 'Vitals Check' | 'Procedure Prep' | 'Consultation Follow-up';
  status: 'Pending' | 'In Progress' | 'Done';
  notes: string;
  patientId: string;
  assigneeId: string;
  assigneeName?: string; // Added for display purposes
  dueAt: string;
  createdBy: string;
  createdAt?: string;
}

export interface TaskFormData {
  id: string;
  title: string;
  type: 'Medication' | 'Vitals Check' | 'Procedure Prep' | 'Consultation Follow-up';
  patientId: string;
  assigneeId: string;
  dueAt: string;
  status: 'Pending' | 'In Progress' | 'Done';
  notes: string;
}

// -------- types --------
export type Role = 'admin' | 'doctor' | 'nurse';
export type TaskStatus = 'Pending' | 'In Progress' | 'Done';
export type TaskType =
  | 'Medication'
  | 'Vitals Check'
  | 'Procedure Prep'
  | 'Consultation Follow-up';

export interface TaskFormValues {
  id: string;
  title: string;
  type: TaskType;
  patientId: string;
  assigneeId: string;
  dueAt: string; // updated to string instead of Date
  status: TaskStatus;
  notes: string;
}