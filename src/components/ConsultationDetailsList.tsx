import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

interface ConsultationDetailsListProps {
  symptoms?: string[];
  diagnosis?: string;
  notes?: string;
  isReadOnly?: boolean;
}

const ConsultationDetailsList: React.FC<ConsultationDetailsListProps> = ({
  symptoms,
  diagnosis,
  notes,
  isReadOnly = false,
}) => (
  <List dense>
    <ListItem>
      <ListItemText
        primary="Symptoms"
        secondary={isReadOnly ? symptoms?.join(', ') || '-' : ''}
      />
    </ListItem>
    <ListItem>
      <ListItemText
        primary="Diagnosis"
        secondary={isReadOnly ? diagnosis || '-' : ''}
      />
    </ListItem>
    <ListItem>
      <ListItemText
        primary="Consultation Notes"
        secondary={isReadOnly ? notes || '-' : ''}
      />
    </ListItem>
  </List>
);

export default ConsultationDetailsList;