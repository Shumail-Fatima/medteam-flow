import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/Store';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface UseCrudOperationsProps<T> {
  onAdd?: (item: T) => Promise<any>;
  onUpdate?: (item: T) => Promise<any>;
  onDelete?: (item: T | string) => Promise<any>;
  successMessages?: {
    add?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    add?: string;
    update?: string;
    delete?: string;
  };
}

export const useCrudOperations = <T>({
  onAdd,
  onUpdate,
  onDelete,
  successMessages = {},
  errorMessages = {}
}: UseCrudOperationsProps<T>) => {
  const dispatch = useDispatch<AppDispatch>();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = useCallback(async (item: T) => {
    if (!onAdd) return;
    
    setIsLoading(true);
    try {
      await onAdd(item);
      setSnackbar({
        open: true,
        message: successMessages.add || 'Item added successfully!',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: errorMessages.add || 'Failed to add item',
        severity: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onAdd, successMessages.add, errorMessages.add]);

  const handleUpdate = useCallback(async (item: T) => {
    if (!onUpdate) return;
    
    setIsLoading(true);
    try {
      await onUpdate(item);
      setSnackbar({
        open: true,
        message: successMessages.update || 'Item updated successfully!',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: errorMessages.update || 'Failed to update item',
        severity: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate, successMessages.update, errorMessages.update]);

  const handleDelete = useCallback(async (item: T | string) => {
    if (!onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete(item);
      setSnackbar({
        open: true,
        message: successMessages.delete || 'Item deleted successfully!',
        severity: 'success'
      });
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: errorMessages.delete || 'Failed to delete item',
        severity: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onDelete, successMessages.delete, errorMessages.delete]);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    isLoading,
    handleAdd,
    handleUpdate,
    handleDelete,
    closeSnackbar
  };
};
