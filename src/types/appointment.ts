export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  age?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  appointmentSlot: string;
  reason?: string;
  createdAt: string;
}

export interface DoctorSpecialty {
  id: string;
  name: string;
  description: string;
}

export interface DoctorOption {
  label: string;
  value: string;
  availableSlots: string[];
  specialtyId?: string;
  specialtyName?: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentSlot: string;
  reason?: string;
  specialtyId?: string;
}

export interface PatientFormData {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}