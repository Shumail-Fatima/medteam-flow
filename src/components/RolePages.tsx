import {
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    Support as SupportIcon,
    Dashboard as DashboardIcon,
    Route,
  } from '@mui/icons-material';
  
  export const rolePages = {
    admin: [
      { label: 'User Management', icon: <PeopleIcon />, path: '/admin/user-management' },
      { label: 'Task Management', icon: <AssignmentIcon />, path: '/task-management' },
      { label: 'Appointment', icon: <AssessmentIcon />, path: '/Appointment' },
      { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      { label: 'Support', icon: <SupportIcon />, path: '/support' },
    ],
    doctor: [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/doc/dashboard' },
      { label: 'Task Management', icon: <AssignmentIcon />, path: '/task-management'},
      { label: 'Appointment', icon: <AssessmentIcon />, path: '/Appointment'},
      { label: 'Patient Management', icon: <PeopleIcon />, path: '/patients'},
      { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      { label: 'Support', icon: <SupportIcon />, path: '/support' },
      { label: 'Consultations', icon: <AssessmentIcon />, path: '/consultations-records' },
      
    ],
  };