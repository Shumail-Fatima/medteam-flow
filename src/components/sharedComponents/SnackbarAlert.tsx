//import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface Props {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

const SnackbarAlert = ({ open, message, severity, onClose }: Props) => (
  <Snackbar open={open} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <Alert onClose={onClose} severity={severity} sx={{ borderRadius: 2 }}>{message}</Alert>
  </Snackbar>
);

export default SnackbarAlert;