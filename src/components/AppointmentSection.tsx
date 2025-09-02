import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

interface AppointmentSectionProps {
  preSelectedAppointment: any;
  watchedFollowUpRequired: boolean;
  watch: (field: string) => any;
  formatDate: (dateString: string) => string;
}

const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  preSelectedAppointment,
  watchedFollowUpRequired,
  watch,
  formatDate,
}) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Appointment
      </Typography>
      <Grid size={{xs: 12}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            {preSelectedAppointment ? (
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formatDate(preSelectedAppointment.appointmentSlot)}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {preSelectedAppointment.reason}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Follow-up Required
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {watchedFollowUpRequired ? "Yes" : "No"}
                  </Typography>
                </Grid>
                {watchedFollowUpRequired && (
                  <Grid size={{xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Follow-up Date
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {watch('followUpDate') ? formatDate(watch('followUpDate') || '') : '-'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Typography color="error">No appointment selected.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </CardContent>
  </Card>
);

export default AppointmentSection;