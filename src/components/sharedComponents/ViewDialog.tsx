import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';

interface ViewDialogField {
    label: string;
    value: React.ReactNode;
}

interface ViewDialogProps{
    open: boolean;
    onClose: () => void;
    title: string;
    avatar?: React.ReactNode;
    chip?: React.ReactNode;
    fields: ViewDialogField[];
}

const viewDialog: React.FC <ViewDialogProps> = ({
    open,onClose, title, avatar, chip, fields,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ pb: 1 }}>
      <Typography variant="h6" component="span" fontWeight="bold">
        {title}
      </Typography>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {avatar}
        <Box>
          {chip}
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {fields.map((field) => (
          <Box key={field.label}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.label}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {field.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default viewDialog;