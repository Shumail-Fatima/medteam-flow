// Medical-related type definitions
export interface MedicalHistoryEntry {
  id: string;
  date: string;
  type: 'diagnosis' | 'prescription' | 'consultation' | 'procedure';
  doctorId: string;
  doctorName: string;
  title: string;
  description: string;
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  dosage?: string;
  symptoms?: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface ExtendedPatient {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory: MedicalHistoryEntry[];
  allergies: string[];
  bloodType?: string;
  age?: number;
  createdAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PatientFormData{
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  age?: number;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  notes: string;
  prescriptions: Prescription[];
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export interface ConsultationFormData {
  patientId: string;
  appointmentId?: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface ExtendedAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  appointmentSlot: string;
  reason?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  consultationCompleted: boolean;
  createdAt: string;
}