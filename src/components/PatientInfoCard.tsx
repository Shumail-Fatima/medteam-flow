import React from 'react';
import { Paper, List, ListItem, ListItemText } from '@mui/material';

interface PatientInfoCardProps {
  name: string;
  age: number | undefined;
  bloodType?: string;
  allergies?: string[];
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ name, age, bloodType, allergies = [] }) => (
  <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
    <List dense>
      <ListItem>
        <ListItemText primary="Patient Name" secondary={name} />
      </ListItem>
      <ListItem>
        <ListItemText primary="Age" secondary={age} />
      </ListItem>
      {bloodType && (
        <ListItem>
          <ListItemText primary="Blood Type" secondary={bloodType} />
        </ListItem>
      )}
      {allergies.length > 0 && (
        <ListItem>
          <ListItemText
            primary="Allergies"
            secondary={allergies.join(', ')}
            secondaryTypographyProps={{ color: 'error' }}
          />
        </ListItem>
      )}
    </List>
  </Paper>
);

export default PatientInfoCard;