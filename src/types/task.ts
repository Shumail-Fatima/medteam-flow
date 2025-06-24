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

export interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
}

export interface TaskUser {
  id: string;
  name: string;
  role: string;
}


export interface Patient {
  id: string;
  name: string;
  // Add other patient fields as needed
}

export interface TaskUser {
  id: string;
  name: string;
  // Add other user fields as needed
}