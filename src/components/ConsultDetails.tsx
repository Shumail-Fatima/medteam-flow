import React from 'react';
import { Card, CardContent, Typography, Grid, List, ListItem, ListItemText, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

interface ConsultationDetailsSectionProps {
  isReadOnly: boolean;
  consultationRecord: any;
  control: any;
  errors: any;
}

const ConsultationDetailsSection: React.FC<ConsultationDetailsSectionProps> = ({
    isReadOnly, consultationRecord, control, errors,
}) => (<Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Consultation Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Symptoms" secondary={isReadOnly ? consultationRecord?.symptoms?.join(', ') || '-' : ''} />
                  </ListItem>
                  {!isReadOnly && (
                    <Controller
                      name="symptoms"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.symptoms}
                          helperText={errors.symptoms?.message || 'Separate multiple symptoms with commas'}
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  )}
                  <ListItem>
                    <ListItemText primary="Diagnosis" secondary={isReadOnly ? consultationRecord?.diagnosis || '-' : ''} />
                  </ListItem>
                  {!isReadOnly && (
                    <Controller
                      name="diagnosis"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          error={!!errors.diagnosis}
                          helperText={errors.diagnosis?.message}
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  )}
                  <ListItem>
                    <ListItemText primary="Consultation Notes" secondary={isReadOnly ? consultationRecord?.notes || '-' : ''} />
                  </ListItem>
                  {!isReadOnly && (
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.notes}
                          helperText={errors.notes?.message}
                        />
                      )}
                    />
                  )}
                </List>
              </CardContent>
            </Card>);

export default ConsultationDetailsSection;