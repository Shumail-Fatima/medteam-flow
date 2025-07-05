// Type definitions for settings and support functionality
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  systemAlerts: boolean;
  autoLogout: number; // minutes
  dateFormat: string;
  timeFormat: '12h' | '24h';
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  responses?: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  ticketId: string;
  responderId: string;
  responderName: string;
  responderRole: 'user' | 'support' | 'admin';
  message: string;
  createdAt: string;
}

export interface SettingsFormData {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  systemAlerts: boolean;
  autoLogout: number;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface SupportTicketFormData {
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
}

export interface SupportResponseFormData {
  message: string;
}