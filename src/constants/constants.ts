export const API_BASE_URL: string = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';

export const ROLE_IDS = {
  ADMIN: '1',
  DOCTOR: '2',
  NURSE: '3',
  RECEPTIONIST: '4',
} as const;

export const NOTIFICATION_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  CANCELLED: 'cancelled',
  REMINDER: 'reminder',
} as const;

export const API_URL = import.meta.env.VITE_BACKEND_URL