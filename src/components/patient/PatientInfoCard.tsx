import React from 'react';
import { Paper, List, ListItem, ListItemText } from '@mui/material';
import type { ExtendedPatient } from '../../types/medical';

interface PatientInfoCardProps {
  patient: ExtendedPatient | null;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  if (!patient) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
      <List dense>
        <ListItem>
          <ListItemText primary="Patient Name" secondary={patient.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Age" secondary={patient.age} />
        </ListItem>
        {patient.bloodType && (
          <ListItem>
            <ListItemText primary="Blood Type" secondary={patient.bloodType} />
          </ListItem>
        )}
        {patient.allergies && patient.allergies.length > 0 && (
          <ListItem>
            <ListItemText
              primary="Allergies"
              secondary={patient.allergies.join(', ')}
              secondaryTypographyProps={{ color: 'error' }}
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default PatientInfoCard; 