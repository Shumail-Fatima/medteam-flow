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
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/sharedComponents/Layout';
import type { RootState } from '../store/Store';
import type { ExtendedPatient } from '../types/medical';
import { useAuth } from '../context/AuthContext';

const PatientDetails: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const patients = useSelector((state: RootState) => state.medical.extendedPatients);
  const consultations = useSelector((state: RootState) => state.medical.consultations);
  const appointments = useSelector((state: RootState) => state.appointments.appointments);

  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] = useState(false);

  const currentPatient = useMemo(() => {
    if (patientId) {
      return patients.find(p => p.id === patientId) || null;
    }
    return null;
  }, [patients, patientId]);

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => 
      apt.patientId === patientId && apt.doctorId === user?.id
    );
  };

  const getPatientConsultations = (patientId: string) => {
    return consultations.filter(cons => 
      cons.patientId === patientId && cons.doctorId === user?.id
    );
  };

  const handleViewMedicalHistory = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);
    setMedicalHistoryDialogOpen(true);
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

  if (!currentPatient) {
    return (
      <Layout>
        <Typography>Patient not found.</Typography>
      </Layout>
    );
  }

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
                    label={`Date of Birth: ${currentPatient.dateOfBirth}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
              
              <Grid container spacing={12}>
                <Grid>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={currentPatient.email}
                    />
                  </ListItem>
                </Grid>
                <Grid>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={currentPatient.phone}
                    />
                  </ListItem>
                </Grid>
                {currentPatient.address && (
                  <Grid>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><Home fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={currentPatient.address}
                      />
                    </ListItem>
                  </Grid>
                )}
                {currentPatient.bloodType && (
                  <Grid>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><Bloodtype fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Blood Type" 
                        secondary={currentPatient.bloodType}
                      />
                    </ListItem>
                  </Grid>
                )}
              </Grid>

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

        <Grid size={12}>
          <Grid container spacing={3}>
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
          </Grid>
        </Grid>
      </Grid>
      
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
                            color={getHistoryTypeColor(entry.type) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
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

export default PatientDetails; 