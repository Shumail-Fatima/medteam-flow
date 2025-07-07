import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import { Close, BugReport, Help, RequestPage, Payment, Settings } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SupportTicketFormData, SupportTicket } from '../../types/settings';
import { supportTicketValidationSchema } from '../../validation/SettingsValidation';

interface SupportTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupportTicketFormData) => void;
  ticket?: SupportTicket | null;
  isLoading?: boolean;
  mode?: 'create' | 'view';
}

const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  open,
  onClose,
  onSubmit,
  ticket,
  isLoading = false,
  mode = 'create',
}) => {
  const isView = mode === 'view';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketFormData>({
    resolver: yupResolver(supportTicketValidationSchema),
    defaultValues: {
      category: 'general',
      priority: 'medium',
      subject: '',
      description: '',
    },
  });

  useEffect(() => {
    if (ticket && isView) {
      reset({
        category: ticket.category,
        priority: ticket.priority,
        subject: ticket.subject,
        description: ticket.description,
      });
    } else if (!isView) {
      reset({
        category: 'general',
        priority: 'medium',
        subject: '',
        description: '',
      });
    }
  }, [ticket, reset, isView, open]);

  const handleFormSubmit = (data: SupportTicketFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BugReport />;
      case 'billing': return <Payment />;
      case 'feature-request': return <RequestPage />;
      case 'bug-report': return <BugReport />;
      case 'general': return <Help />;
      default: return <Help />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'error';
      case 'billing': return 'warning';
      case 'feature-request': return 'info';
      case 'bug-report': return 'error';
      case 'general': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {isView ? 'Support Ticket Details' : 'Create Support Ticket'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isView ? 'View ticket information and responses' : 'Describe your issue and we\'ll help you resolve it'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          {isView && ticket && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={getCategoryIcon(ticket.category)}
                  label={ticket.category.replace('-', ' ').toUpperCase()}
                  color={getCategoryColor(ticket.category)}
                  size="small"
                />
                <Chip
                  label={ticket.priority.toUpperCase()}
                  color={getPriorityColor(ticket.priority)}
                  size="small"
                />
                <Chip
                  label={ticket.status.toUpperCase()}
                  color={ticket.status === 'resolved' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
              {ticket.resolvedAt && (
                <Typography variant="body2" color="text.secondary">
                  Resolved: {new Date(ticket.resolvedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                {...register('category')}
                select
                label="Category"
                fullWidth
                disabled={isView}
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                <MenuItem value="technical">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReport fontSize="small" />
                    Technical Issue
                  </Box>
                </MenuItem>
                <MenuItem value="billing">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment fontSize="small" />
                    Billing
                  </Box>
                </MenuItem>
                <MenuItem value="feature-request">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RequestPage fontSize="small" />
                    Feature Request
                  </Box>
                </MenuItem>
                <MenuItem value="bug-report">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReport fontSize="small" />
                    Bug Report
                  </Box>
                </MenuItem>
                <MenuItem value="general">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Help fontSize="small" />
                    General
                  </Box>
                </MenuItem>
              </TextField>

              <TextField
                {...register('priority')}
                select
                label="Priority"
                fullWidth
                disabled={isView}
                error={!!errors.priority}
                helperText={errors.priority?.message}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Box>

            <TextField
              {...register('subject')}
              label="Subject"
              fullWidth
              disabled={isView}
              error={!!errors.subject}
              helperText={errors.subject?.message}
              placeholder="Brief description of your issue"
            />

            <TextField
              {...register('description')}
              label="Description"
              fullWidth
              multiline
              rows={6}
              disabled={isView}
              error={!!errors.description}
              helperText={errors.description?.message}
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView && (
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
              }}
            >
              Submit Ticket
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupportTicketModal;