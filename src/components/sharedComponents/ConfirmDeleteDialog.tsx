//import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
} from '@mui/material';

interface Props {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteDialog = ({ open, itemName, onConfirm, onClose }: Props) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Delete</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete <strong>{itemName}</strong>?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;
