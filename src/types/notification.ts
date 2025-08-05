export interface Notification {
  id: string;
  type: 'appointment' | 'consultation' | 'task' | 'followup';
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  appointmentId?: string;
  consultationId?: string;
  patientId?: string;
}