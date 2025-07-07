import * as yup from 'yup';

// Validation schema for user settings form
export const settingsValidationSchema = yup.object({
  theme: yup.string().oneOf(['light', 'dark', 'auto']).required('Theme is required'),
  language: yup.string().required('Language is required'),
  timezone: yup.string().required('Timezone is required'),
  emailNotifications: yup.boolean(),
  smsNotifications: yup.boolean(),
  appointmentReminders: yup.boolean(),
  systemAlerts: yup.boolean(),
  autoLogout: yup.number()
    .min(5, 'Auto logout must be at least 5 minutes')
    .max(480, 'Auto logout cannot exceed 8 hours')
    .required('Auto logout time is required'),
  dateFormat: yup.string().required('Date format is required'),
  timeFormat: yup.string().oneOf(['12h', '24h']).required('Time format is required'),
});

// Validation schema for support ticket creation
export const supportTicketValidationSchema = yup.object({
  category: yup.string()
    .oneOf(['technical', 'billing', 'feature-request', 'bug-report', 'general'])
    .required('Category is required'),
  priority: yup.string()
    .oneOf(['low', 'medium', 'high', 'urgent'])
    .required('Priority is required'),
  subject: yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject cannot exceed 100 characters')
    .required('Subject is required'),
  description: yup.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .required('Description is required'),
});

// Validation schema for support ticket responses
export const supportResponseValidationSchema = yup.object({
  message: yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters')
    .required('Message is required'),
});