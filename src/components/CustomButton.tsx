import React from 'react';
import {
  Button,
  DialogActions,
} from '@mui/material';

interface AddButtonProps{
    onClick: () => void;
    label: string;
    startIcon?: React.ReactNode;
}

interface DailogButtonProps{
    onCancel: () => void;
    isLoading: boolean;
    isEdit?: boolean;
    submitLabel?: string;
}

export const DailogButton: React.FC<DailogButtonProps> = ({
    onCancel, isLoading,isEdit, submitLabel,
}) => {
    const finalSubmitLabel = submitLabel || (typeof isEdit === 'boolean' ? (isEdit ? "Update User" : "Add User") : "Submit");
    return (
    <DialogActions sx={{px: 3, gap: 1}}>
        <Button
        onClick={onCancel}
        disabled= {isLoading}
        sx={{borderRadius: 2}}
        >
            Close
        </Button>
        <Button
        type='submit'
        variant='contained'
        disabled= {isLoading}
        sx={{
            borderRadius: 2,
            px: 3,
            background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
        }}
        >
            {finalSubmitLabel}
        </Button>
    </DialogActions>
)
}



export const AddButton: React.FC<AddButtonProps> = ({
    onClick, label, startIcon
}) => (
    <Button
        variant='contained'
        startIcon= {startIcon}
        onClick={onClick}
        sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
        }}
    >
        {label}
    </Button>
);



//export default AddButton;

