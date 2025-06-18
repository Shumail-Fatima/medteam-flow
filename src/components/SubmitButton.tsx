import React from 'react';
import {
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';

interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  disabled = false,
  children,
}) => {
  const theme = useTheme();

  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      size="large"
      disabled={isLoading || disabled}
      sx={{
        py: 1.5,
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        },
      }}
    >
      {isLoading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;