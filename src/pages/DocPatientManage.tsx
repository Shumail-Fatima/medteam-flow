import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  ContactEmergency,
  Bloodtype,
  Warning,
  LocalHospital,
  Medication,
  Assignment,
  Close,
  Timeline,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import type { RootState, AppDispatch } from '../store/Store';
import type { ExtendedPatient, MedicalHistoryEntry } from '../types/medical';
import { useAuth } from '../context/AuthContext';

const DoctorPatientManagement: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  // Redux state - Get extended patients with medical history
  const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const appointments = useSelector((state: RootState) => state.appointments.appointments);

  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] = useState(false);

  // Filter patients that have had consultations or appointments with current doctor
  const doctorPatients = useMemo(() => {
    const doctorConsultations = consultations.filter(cons => cons.doctorId === user?.id);
    const doctorAppointments = appointments.filter(apt => apt.doctorId === user?.id);
    const consultationPatientIds = [...new Set(doctorConsultations.map(cons => cons.patientId))];
    const appointmentPatientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
    const allPatientIds = [...new Set([...consultationPatientIds, ...appointmentPatientIds])];
    return patients.filter(patient => allPatientIds.includes(patient.id));
  }, [patients, consultations, appointments, user?.id]);

  // Get specific patient if patientId is provided
  const currentPatient = useMemo(() => {
    if (patientId) {
      return patients.find(p => p.id === patientId) || null;
    }
    return null;
  }, [patients, patientId]);

  // Get patient's appointments with current doctor
  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => 
      apt.patientId === patientId && apt.doctorId === user?.id
    );
  };

  // Get patient's consultations with current doctor
  const getPatientConsultations = (patientId: string) => {
    return consultations.filter(cons => 
      cons.patientId === patientId && cons.doctorId === user?.id
    );
  };

  const handleViewPatient = (patient: ExtendedPatient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleViewMedicalHistory = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);
    setMedicalHistoryDialogOpen(true);
  };

  const handleStartConsultation = (patient: ExtendedPatient) => {
    navigate(`/consultation?patientId=${patient.id}`);
  };

  const handleBackToPatients = () => {
    navigate('/patients');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getHistoryTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <LocalHospital color="error" />;
      case 'prescription': return <Medication color="primary" />;
      case 'consultation': return <Assignment color="info" />;
      case 'procedure': return <LocalHospital color="warning" />;
      default: return <Assignment />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'error';
      case 'prescription': return 'primary';
      case 'consultation': return 'info';
      case 'procedure': return 'warning';
      default: return 'default';
    }
  };

  // If viewing specific patient
  if (currentPatient) {
    const patientAppointments = getPatientAppointments(currentPatient.id);
    const patientConsultations = getPatientConsultations(currentPatient.id);

    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Button 
            onClick={handleBackToPatients} 
            sx={{ mb: 2, textTransform: 'none' }}
          >
            ← Back to Patients
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Patient Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive medical record and consultation history
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Patient Information Card */}
          <Grid size={12}>
            <Card sx={{ borderRadius: 3, height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mr: 2,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem'
                    }}
                  >
                    {currentPatient.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {currentPatient.name}
                    </Typography>
                    <Chip
                      label={`Age: ${calculateAge(currentPatient.dateOfBirth)}`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={currentPatient.email}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={currentPatient.phone}
                    />
                  </ListItem>
                  {currentPatient.address && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><Home fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={currentPatient.address}
                      />
                    </ListItem>
                  )}
                  {currentPatient.bloodType && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><Bloodtype fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Blood Type" 
                        secondary={currentPatient.bloodType}
                      />
                    </ListItem>
                  )}
                </List>

                {/* Emergency Contact */}
                {currentPatient.emergencyContact && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Emergency Contact
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon><ContactEmergency fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary={currentPatient.emergencyContact.name}
                          secondary={`${currentPatient.emergencyContact.relationship} • ${currentPatient.emergencyContact.phone}`}
                        />
                      </ListItem>
                    </List>
                  </>
                )}

                {/* Allergies */}
                {currentPatient.allergies.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Allergies
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {currentPatient.allergies.map((allergy, index) => (
                        <Chip
                          key={index}
                          icon={<Warning />}
                          label={allergy}
                          color="error"
                          size="small"
                        />
                      ))}
                    </Box>
                  </>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Timeline />}
                    onClick={() => handleViewMedicalHistory(currentPatient)}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    Medical Timeline
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical History and Consultations */}
          <Grid size={12}>
            <Grid container spacing={3}>
              {/* Recent Consultations */}
              <Grid size={12}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Recent Consultations
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => navigate(`/consultations-records?patientId=${currentPatient.id}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        View All
                      </Button>
                    </Box>
                    {patientConsultations.length > 0 ? (
                      <List>
                        {patientConsultations.slice(0, 5).map((consultation, index) => (
                          <React.Fragment key={consultation.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary={consultation.diagnosis}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(consultation.date)}
                                    </Typography>
                                    <br />
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {consultation.notes.substring(0, 150)}...
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < patientConsultations.slice(0, 5).length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No consultations recorded yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Upcoming Appointments 
              <Grid >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Upcoming Appointments
                    </Typography>
                    {patientAppointments.filter(apt => new Date(apt.appointmentSlot) > new Date()).length > 0 ? (
                      <List>
                        {patientAppointments
                          .filter(apt => new Date(apt.appointmentSlot) > new Date())
                          .slice(0, 3)
                          .map((appointment, index) => (
                            <React.Fragment key={appointment.id}>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                  primary={appointment.reason || 'General Consultation'}
                                  secondary={formatDate(appointment.appointmentSlot)}
                                />
                                <Chip
                                  label={appointment.status}
                                  color="primary"
                                  size="small"
                                />
                              </ListItem>
                              {index < 2 && <Divider />}
                            </React.Fragment>
                          ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No upcoming appointments
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
          */}
            </Grid>
          </Grid>
        </Grid>
      </Layout>
    );
  }

  // Main patients list view
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Patient Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your patients' medical records and consultation history
        </Typography>
      </Box>

      {/* Patients Table */}
      <DataTable<ExtendedPatient>
        data={doctorPatients}
        columns={[
          {
            header: 'Patient',
            render: (patient) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {patient.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Age: {calculateAge(patient.dateOfBirth)}
                  </Typography>
                </Box>
              </Box>
            )
          },
          {
            header: 'Contact',
            render: (patient) => (
              <Box>
                <Typography variant="body2">{patient.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {patient.phone}
                </Typography>
              </Box>
            )
          },
          {
            header: 'Last Consultation',
            render: (patient) => {
              const lastConsultation = getPatientConsultations(patient.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              return lastConsultation ? (
                <Box>
                  <Typography variant="body2">
                    {formatDate(lastConsultation.date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastConsultation.diagnosis}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No consultations
                </Typography>
              );
            }
          },
          {
            header: 'Allergies',
            render: (patient) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {patient.allergies.slice(0, 2).map((allergy, index) => (
                  <Chip
                    key={index}
                    label={allergy}
                    color="error"
                    size="small"
                  />
                ))}
                {patient.allergies.length > 2 && (
                  <Chip
                    label={`+${patient.allergies.length - 2}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )
          },
        ]}
        onView={handleViewPatient}
        onEdit={() => {}} // Doctors can't edit patient basic info
        onDelete={() => {}} // Doctors can't delete patients
        showEdit={() => false}
        showDelete={() => false}
      />

      {/* Medical History Timeline Dialog */}
      <Dialog 
        open={medicalHistoryDialogOpen} 
        onClose={() => setMedicalHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6" fontWeight="bold">
            Medical Timeline - {selectedPatient?.name}
          </Typography>
          <IconButton onClick={() => setMedicalHistoryDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && selectedPatient.medicalHistory.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {selectedPatient.medicalHistory
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry, index) => (
                  <Paper key={entry.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {getHistoryTypeIcon(entry.type)}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {entry.title}
                          </Typography>
                          <Chip
                            label={entry.type}
                            color={getHistoryTypeColor(entry.type)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formatDate(entry.date)} • Dr. {entry.doctorName}
                        </Typography>
                        <Typography variant="body2">
                          {entry.description}
                        </Typography>
                        {entry.dosage && (
                          <Typography variant="caption" color="primary.main">
                            Dosage: {entry.dosage}
                          </Typography>
                        )}
                        {entry.symptoms && entry.symptoms.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Symptoms: {entry.symptoms.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No medical history recorded
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMedicalHistoryDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default DoctorPatientManagement;