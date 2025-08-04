import React from 'react';
import { Card, CardContent, Typography, Grid, List, ListItem, ListItemText, TextField, Box, Button, IconButton, Paper } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Add, Remove, Medication } from '@mui/icons-material';

interface PrescriptionSectionProps {
    isReadOnly: boolean;
    consultationRecord: any;
    fields: any[];
    control: any;
    errors: any;
    addPrescription: () => void;
    removePrescription: (index: number) => void;
}

const PrescriptionsSection: React.FC<PrescriptionSectionProps> = ({
    isReadOnly, consultationRecord, fields, control, errors, addPrescription, removePrescription,
}) => (
    <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Prescriptions
                  </Typography>
                  {!isReadOnly && (
                  <Button
                    startIcon={<Add />}
                    onClick={addPrescription}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Prescription
                  </Button>
                )}
                </Box>

                {fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Prescription {index + 1}
                      </Typography>
                      {fields.length > 1 && (
                        <IconButton
                          onClick={() => removePrescription(index)}
                          color="error"
                          size="small"
                        >
                          <Remove />
                        </IconButton>
                      )}
                    </Box>


                    {isReadOnly ? (
                      consultationRecord?.prescriptions?.length ? (
                        <Grid container spacing={2}>
                        {consultationRecord.prescriptions.map((rx: any, idx: number) => (
                          <Grid key={rx.id || idx} size={{ xs: 12, sm: 6, md: 4 }} >
                            <Box sx={{ mb: 2, pl: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {rx.medication}
                            </Typography>
                            <Typography variant="body2">
                              Dosage: {rx.dosage} | Frequency: {rx.frequency} | Duration: {rx.duration}
                            </Typography>
                            {rx.instructions && (
                              <Typography variant="body2" color="text.secondary">
                                Instructions: {rx.instructions}
                              </Typography>
                            )}</Box>
                          </Grid>
                        ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No prescriptions</Typography>
                      )
                    ) : (
                    <Grid container spacing={2}>
                      <Grid size={{xs: 12, sm: 6, md: 3 }}>
                        <Controller
                          name={`prescriptions.${index}.medication`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Medication"
                              fullWidth
                              size="small"
                              InputProps={{
                                startAdornment: <Medication sx={{ mr: 1, color: 'action.active' }} />,
                                readOnly: isReadOnly,
                              }}
                              />
                          )}
                        />
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3 }}>
                        <Controller
                          name={`prescriptions.${index}.dosage`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Dosage"
                              fullWidth
                              size="small"
                              placeholder="e.g., 10mg"
                              InputProps={{ readOnly: isReadOnly }}
                              />
                          )}
                        />
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3 }}>
                        <Controller
                          name={`prescriptions.${index}.frequency`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Frequency"
                              fullWidth
                              size="small"
                              placeholder="e.g., Twice daily"
                              InputProps={{ readOnly: isReadOnly }}
                              />
                          )}
                        />
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3 }}>
                        <Controller
                          name={`prescriptions.${index}.duration`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Duration"
                              fullWidth
                              size="small"
                              placeholder="e.g., 7 days"
                              InputProps={{ readOnly: isReadOnly }}
                              />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Controller
                          name={`prescriptions.${index}.instructions`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Instructions"
                              fullWidth
                              multiline
                              rows={4}
                              size="small"
                              placeholder="e.g., Take with food"
                              InputProps={{ readOnly: isReadOnly }}
                              />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
);

export default PrescriptionsSection;