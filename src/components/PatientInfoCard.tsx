import React from 'react';
import { Paper, List, ListItem, ListItemText, Grid } from '@mui/material';

interface PatientInfoCardProps {
  name: string;
  age: number | undefined;
  bloodType?: string;
  allergies?: string[];
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ name, age, bloodType, allergies = [] }) => (
  <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
    <Grid container spacing={12}>
      <Grid>
      <ListItem sx={{ px: 0 }}>
        <ListItemText primary="Patient Name" secondary={name} />
      </ListItem>
      </Grid>
      <Grid>
      <ListItem sx={{ px: 0 }}>
        <ListItemText primary="Age" secondary={age} />
      </ListItem>
      </Grid>
      {bloodType && (
        <Grid>
        <ListItem sx={{ px: 0 }}>
          <ListItemText primary="Blood Type" secondary={bloodType} />
        </ListItem>
        </Grid>
      )}
      {allergies.length > 0 && (
        <Grid>
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary="Allergies"
            secondary={allergies.join(', ')}
            secondaryTypographyProps={{ color: 'error' }}
          />
        </ListItem>
        </Grid>
      )}
    </Grid>
  </Paper>
);

export default PatientInfoCard;