export interface Task {
  id: string;
  title: string;
  type: 'Medication' | 'Vitals Check' | 'Procedure Prep' | 'Consultation Follow-up';
  status: 'Pending' | 'In Progress' | 'Done';
  notes: string;
  patientId: string;
  assigneeId: string;
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
