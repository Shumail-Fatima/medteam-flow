import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Today,
  Assignment,
  Person,
  Add,
  Schedule,
  LocalHospital,
  AccessTime,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import { useAuth } from '../context/AuthContext';
import type { RootState } from '../store/Store';
import type { ExtendedAppointment } from '../types/medical';
import { updateConsultation } from '../store/slices/MedicalSlice';
import PageHeader from '../components/sharedComponents/PageHeader';
import StatCard from '../components/dashboard/StatCard';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();


  // Redux state - Get appointments, tasks, and consultations for current doctor
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  //const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const patients = useSelector((state: RootState) => state.patients.patients);

  // Filter data for current doctor
  const doctorAppointments = useMemo(() => {
    return appointments.filter(apt => apt.doctorId === user?.id) as ExtendedAppointment[];
  }, [appointments, user?.id]);

  const doctorTasks = useMemo(() => {
    return tasks.filter(task => task.assigneeId === user?.id || task.createdBy === user?.id);
  }, [tasks, user?.id]);

  const doctorConsultations = useMemo(() => {
    return consultations.filter(cons => cons.doctorId === user?.id);
  }, [consultations, user?.id]);

  // Get today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return doctorAppointments.filter(apt => 
      new Date(apt.appointmentSlot).toDateString() === today 
      && !apt.consultationCompleted // Only show if not completed
    );
  }, [doctorAppointments]);

  // Get pending consultation tasks

  const pendingConsultations = useMemo(() => {
    return doctorAppointments.filter(apt => 
      apt.status === 'scheduled' && !apt.consultationCompleted
    );
  }, [doctorAppointments]);
  
  const completedConsultations = useMemo(() =>
    consultations.filter(c => c.doctorId === user?.id && c.status === 'completed'),
    [consultations, user?.id]
  );
  
  const pendingAppointments = useMemo(() =>
    appointments.filter(a => a.doctorId === user?.id && a.status === 'scheduled' && !a.consultationCompleted),
    [appointments, user?.id]
  );
  
  const completedAppointments = useMemo(() =>
    appointments.filter(a => a.doctorId === user?.id && a.status === 'completed'),
    [appointments, user?.id]
  );
  

  // Get recently accessed patients (last 5 consultations)
  const recentPatients = useMemo(() => {
    const recentConsultations = [...doctorConsultations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    return recentConsultations.map(cons => {
      const patient = patients.find(p => p.id === cons.patientId);
      return {
        consultation: cons,
        patient: patient
      };
    }).filter(item => item.patient);
  }, [doctorConsultations, patients]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        // subtitle="Here's your medical practice overview for today."
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={3}>
          <StatCard
            title="Today's Appointments"
            value={`${todaysAppointments.length}/${doctorAppointments.length}`}
            icon={<Today />}
            color="primary.main"
          />
        </Grid>
        
        <Grid size={3}>
          <StatCard
            title="Pending Consultations"
            value={`${pendingConsultations.length}/${doctorAppointments.filter(a => a.status === 'scheduled').length}`}
            icon={<Assignment />}
            color="warning.main"
          />
        </Grid>

        <Grid size={3}>
          <StatCard
            title="Total Consultations"
            value={doctorConsultations.length}
            icon={<LocalHospital />}
            color="success.main"
          />
        </Grid>

        <Grid size={3}>
          <StatCard
            title="Pending Tasks"
            value={`${doctorTasks.filter(t => t.status === 'Pending').length}/${doctorTasks.length}`}
            icon={<Assignment />}
            color="info.main"
          />
        </Grid>
      </Grid>
     

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Today's Appointments
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/Appointment')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              
              {todaysAppointments.length > 0 ? (
                <List>
                  {todaysAppointments.slice(0, 4).map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.patientName}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatTime(appointment.appointmentSlot)}
                              </Typography>
                            </Box>
                          }
                        />
                        {appointment.consultationCompleted ? (
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/consultation?appointmentId=${appointment.id}&patientId=${appointment.patientId}`)}
                          sx={{ textTransform: 'none' }}
                        >
                          Start
                        </Button>
                        )}
                      </ListItem>
                      {index < todaysAppointments.slice(0, 4).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No appointments scheduled for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/Appointment')}
                  sx={{ borderRadius: 2 }}
                >
                  View Appointments
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate('/patients')}
                  sx={{ borderRadius: 2 }}
                >
                  Patient Records
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/task-management')}
                  sx={{ borderRadius: 2 }}
                >
                  My Tasks
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default DoctorDashboard;