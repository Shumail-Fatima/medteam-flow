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
  specialtyName?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  consultationCompleted: boolean;
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
  description?: string;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentSlot: string;
  reason?: string;
  specialtyId?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
}

export interface PatientFormData {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}