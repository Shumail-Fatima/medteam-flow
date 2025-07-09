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
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import { useAuth } from '../context/AuthContext';
import type { RootState } from '../store/Store';
import type { ExtendedAppointment } from '../types/medical';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redux state - Get appointments, tasks, and consultations for current doctor
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const patients = useSelector((state: RootState) => state.medical.extendedPatients);

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
    );
  }, [doctorAppointments]);

  // Get pending consultation tasks
  const pendingConsultations = useMemo(() => {
    return doctorAppointments.filter(apt => 
      apt.status === 'scheduled' && !apt.consultationCompleted
    );
  }, [doctorAppointments]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your medical practice overview for today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {todaysAppointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Appointments
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Today />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {pendingConsultations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Consultations
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {doctorConsultations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Consultations
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <LocalHospital />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {doctorTasks.filter(t => t.status === 'Pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid >
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
                              <Chip
                                label={appointment.status}
                                color={getStatusColor(appointment.status)}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/doc/consultation?appointmentId=${appointment.id}`)}
                          sx={{ textTransform: 'none' }}
                        >
                          {appointment.consultationCompleted ? 'View' : 'Start'}
                        </Button>
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

        {/* Recent Patient Records */}
        <Grid >
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Patient Records
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/doc/patient-manage')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              
              {recentPatients.length > 0 ? (
                <List>
                  {recentPatients.map((item, index) => (
                    <React.Fragment key={item.consultation.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light' }}>
                            {item.patient?.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.patient?.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Last visit: {formatDate(item.consultation.date)}
                              </Typography>
                              <br />
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {item.consultation.diagnosis}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate(`/doc/patient-manage/${item.patient?.id}`)}
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      </ListItem>
                      {index < recentPatients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent patient records
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid >
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/doc/consultation')}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                  }}
                >
                  New Consultation
                </Button>
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
                  onClick={() => navigate('/doc/patient-manage')}
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