import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Avatar, Grid, Card, CardContent } from '@mui/material';
import { Add, Schedule } from '@mui/icons-material';
import { AddButton } from '../components/CustomButton';
import Layout from '../components/sharedComponents/Layout';
import TaskFormModal from '../components/formModals/TaskFormModal';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { Role, Task, TaskFormData } from '../types/task';
import { useAuth } from '../context/AuthContext';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { fetchTasks, addTaskAsync, updateTaskAsync, deleteTaskAsync } from '../store/slices/TaskSlice';
import { fetchPatients } from '../store/slices/PatientSlice';
import { fetchUsers } from '../store/slices/UserSlice';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';
import { useCrudOperations } from '../hooks/useCrudOperations';
import { usePermissions } from '../hooks/usePermissions';
import { useDataFiltering } from '../hooks/useDataFiltering';
import StatusChip from '../components/sharedComponents/StatusChip';
import FilterBar from '../components/sharedComponents/FilterBar';
import ActionButtons, { createViewAction, createEditAction, createDeleteAction } from '../components/sharedComponents/ActionButtons';

const AdminTaskManagement: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.roleName as 'admin' | 'doctor' | 'nurse';
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const patients = useSelector((state: RootState) => state.patients.patients);
  const users = useSelector((state: RootState) => state.user.users);
  const { sendNotification } = useNotification();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  // Hooks
  const { permissions, canEditItem, canDeleteItem } = usePermissions();
  const { snackbar, closeSnackbar, handleAdd, handleUpdate, handleDelete } = useCrudOperations({
    onAdd: async (task: Task) => {
      await dispatch(addTaskAsync(task)).unwrap();
      const notification = NotificationService.createTaskNotification(
        task.assigneeId,
        user?.id || '',
        task.id,
        task.title,
        'assigned'
      );
      sendNotification(notification);
    },
    onUpdate: async (task: Task) => {
      await dispatch(updateTaskAsync(task)).unwrap();
      const notification = NotificationService.createTaskNotification(
        task.assigneeId,
        user?.id || '',
        task.id,
        task.title,
        task.status === 'Done' ? 'completed' : 'updated'
      );
      sendNotification(notification);
    },
    onDelete: async (item: string | Task) => {
      const taskId = typeof item === 'string' ? item : item.id;
      await dispatch(deleteTaskAsync(taskId)).unwrap();
    },
    successMessages: {
      add: 'Task created successfully!',
      update: 'Task updated successfully!',
      delete: 'Task deleted successfully!',
    },
  });

  const { filters, filteredData, updateFilter, clearFilters } = useDataFiltering({
    data: tasks,
    searchFields: ['title', 'type'],
    filterConfig: {
      statusField: 'status',
      assigneeField: 'assigneeId',
      patientField: 'patientId',
    },
    customFilters: (task, filters) => {
      // Filter by user role
      if (user?.roleName === 'nurse') {
        return String(task.assigneeId) === String(user?.id);
      }
      return true;
    },
  });

  // Effects
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchUsers());
    dispatch(fetchTasks());
  }, [dispatch]);

  // Helper functions
  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getAssigneeName = (assigneeId: string) => {
    const user = users?.find(u => u.id === assigneeId);
    return user?.name || 'Unknown User';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medication': return 'primary';
      case 'Vitals Check': return 'secondary';
      case 'Procedure Prep': return 'warning';
      case 'Consultation Follow-up': return 'info';
      default: return 'default';
    }
  };

  // Statistics
  const getStats = () => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;

    return { totalTasks, pendingTasks, inProgressTasks, completedTasks };
  };

  const stats = getStats();

  // Event handlers
  const handleAddTask = () => {
    if (!permissions.canCreate) {
      return;
    }
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (!canEditItem(task)) {
      return;
    }
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setTaskToView(task);
    setViewDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    if (!canDeleteItem(task)) {
      return;
    }
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleTaskSave = async (taskData: TaskFormData) => {
    if (selectedTask) {
      const updatedTask: Task = {
        ...selectedTask,
        type: taskData.type,
        assigneeId: taskData.assigneeId,
        status: taskData.status,
      };
      await handleUpdate(updatedTask);
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}`,
        createdBy: user?.id?.toString() || 'unknown',
        createdAt: new Date().toISOString(),
      };
      await handleAdd(newTask);
    }
    
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = async (taskId: string) => {
    await handleDelete(taskId);
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      handleTaskDelete(taskToDelete.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter configuration
  const filterFields = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search tasks...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Done', label: 'Done' },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'select' as const,
      options: users.map(user => ({ value: user.id, label: user.name })),
    },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      header: 'Task',
      render: (task: Task) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {task.title}
          </Typography>
          <Chip
            label={task.type}
            color={getTypeColor(task.type)}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      header: 'Patient',
      render: (task: Task) => (
        <Typography variant="body2">
          {getPatientName(task.patientId)}
        </Typography>
      ),
    },
    {
      header: 'Assignee',
      render: (task: Task) => (
        <Typography variant="body2">
          {getAssigneeName(task.assigneeId)}
        </Typography>
      ),
    },
    {
      header: 'Status',
      render: (task: Task) => (
        <StatusChip status={task.status} />
      ),
    },
    {
      header: 'Due Date',
      render: (task: Task) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(task.dueAt)}
        </Typography>
      ),
    },
    {
      header: 'Actions',
      render: (task: Task) => {
        const actions = [
          createViewAction(() => handleViewTask(task)),
          createEditAction(() => handleEditTask(task), !canEditItem(task)),
          createDeleteAction(() => handleDeleteTask(task), !canDeleteItem(task)),
        ];

        return <ActionButtons actions={actions} />;
      },
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Task Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.roleName === 'admin' && 'Create, assign, and manage all healthcare tasks'}
          {user?.roleName === 'doctor' && 'View all tasks, reassign tasks, and manage consultations'}
          {user?.roleName === 'nurse' && 'View your assigned tasks and update task statuses'}
        </Typography>
      </Box>

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {user?.roleName === 'nurse' ? 'My Tasks' : 'All Tasks'}
        </Typography>
        {permissions.canCreate && (
          <AddButton
            onClick={handleAddTask}
            label='Create New Task'
            startIcon={<Add />}
          />
        )}
      </Box>

      {/* Filter Bar */}
      <FilterBar
        filters={filterFields}
        values={filters as Record<string, string>}
        onFilterChange={(key, value) => updateFilter(key as keyof typeof filters, value)}
        onClearFilters={clearFilters}
      />

      {/* Tasks Table */}
      <DataTable<Task>
        data={filteredData}
        sortByDate={(t) => t.dueAt}
        columns={tableColumns}
        // onView={handleViewTask}
        // onEdit={handleEditTask}
        // onDelete={handleDeleteTask}
        // showEdit={canEditItem}
        // showDelete={canDeleteItem}
        emptyMessage="No tasks available"
      />

      {/* Task Form Modal */}
      <TaskFormModal
        open={isModalOpen}
        mode={selectedTask ? 'edit' : 'create'}
        role={String(user?.roleId || '3') as Role}
        taskId={selectedTask?.id}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskSave}
        onDelete={handleTaskDelete}
      />

      {/* View Task Dialog */}
      <ViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        title="Task Details"
        avatar={null}
        chip={
          taskToView && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={taskToView.type}
                color={getTypeColor(taskToView.type)}
                size="small"
              />
              <StatusChip status={taskToView.status} />
            </Box>
          )
        }
        fields={
          taskToView
            ? [
                {
                  label: 'Patient',
                  value: getPatientName(taskToView.patientId),
                },
                {
                  label: 'Assigned To',
                  value: getAssigneeName(taskToView.assigneeId),
                },
                {
                  label: 'Due Date',
                  value: formatDate(taskToView.dueAt),
                },
                {
                  label: 'Notes',
                  value: taskToView.notes || 'No notes provided',
                },
              ]
            : []
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        itemName={taskToDelete?.title || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Success/Error Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={closeSnackbar}
      />
    </Layout>
  );
};

export default AdminTaskManagement;