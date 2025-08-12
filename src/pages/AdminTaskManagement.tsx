import React, { useEffect, useState } from 'react';
import { Box,Typography, Chip, Avatar, Grid, Card, CardContent, } from '@mui/material';
import { Add, Schedule, CheckCircle, Pending, PlayArrow, } from '@mui/icons-material';
import {AddButton} from '../components/CustomButton';
import Layout from '../components/sharedComponents/Layout';
import TaskFormModal from '../components//formModals/TaskFormModal';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { Task, TaskFormData } from '../types/task';
import { useAuth } from '../context/AuthContext';
import ViewDialog from '../components/sharedComponents/ViewDialog';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { fetchTasks, addTaskAsync, updateTaskAsync, deleteTaskAsync } from '../store/slices/TaskSlice';
import { fetchPatients } from '../store/slices/PatientSlice';
import { useNotification } from '../context/NotifSocketContext';
import { NotificationService } from '../utils/NotificationService';


const AdminTaskManagement: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.roleName as 'admin' | 'doctor' | 'nurse';
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.task.tasks);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const { sendNotification } = useNotification();

  // Helper functions
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);
  
  const patients = useSelector((state: RootState) => state.patients.patients);
  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  }

  const users = useSelector((state: RootState) => state.user.users);
  const getAssigneeName = (assigneeId: string) => {
    const user = users?.find(u => u.id === assigneeId);
    return user?.name || 'Unknown User';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Pending />;
      case 'In Progress': return <PlayArrow />;
      case 'Done': return <CheckCircle />;
      default: return <Schedule />;
    }
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

  // Filter tasks based on user role
  const getFilteredTasks = () => {
    switch (userRole) {
      case 'nurse':
        // Nurses can only see their own tasks
        return tasks.filter(task => String(task.assigneeId) === String(user?.id));
      case 'doctor':
      case 'admin':
        // Doctors and admins can see all tasks
        return tasks;
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  // Permission checks
  const canCreateTask = userRole === 'admin';
  
  const canEditTask = (task: Task) => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor') return true;
    if (userRole === 'nurse') return String(task.assigneeId) === String(user?.id);
    return false;
  };

  const canDeleteTask = (task: Task) => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor') return true;
    return false;
  };

  const canReassignTask = (task: Task) => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor') return true;
    return false;
  };

  // Event handlers
  const handleAddTask = () => {
    if (!canCreateTask) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to create tasks.', 
        severity: 'error' 
      });
      return;
    }
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (!canEditTask(task)) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to edit this task.', 
        severity: 'error' 
      });
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
    if (!canDeleteTask(task)) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to delete this task.', 
        severity: 'error' 
      });
      return;
    }
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  // Fetch tasks from API on component mount
    useEffect(() => {
    dispatch(fetchTasks()); // Load tasks from backend on mount
  }, [dispatch]);

  const handleTaskSave = (taskData: TaskFormData) => {
    if (selectedTask) {
      // Edit existing task
      // dispatch(updateTask({...selectedTask, ...taskData}));
      const updatedTask: Task = {
        ...selectedTask,
        type: taskData.type, 
        assigneeId: taskData.assigneeId,
        status: taskData.status
      }
      dispatch(updateTaskAsync(updatedTask));
      /*
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id 
          ? { ...task, ...taskData, createdBy: task.createdBy }
          : task
      ));*/
      setSnackbar({ 
        open: true, 
        message: 'Task updated successfully!', 
        severity: 'success' 
      });
      if (taskData.status == 'Done'){
      const notification = NotificationService.createTaskNotification(
        selectedTask.assigneeId,
        user?.id || '',
        selectedTask.id,
        selectedTask.title,
        'completed'
      )
      sendNotification(notification);
    } else {
      const notification = NotificationService.createTaskNotification(
        selectedTask.assigneeId,
        user?.id || '',
        selectedTask.id,
        selectedTask.title,
        'updated'
      )
      sendNotification(notification);
    }

    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}`,
        createdBy: user?.id?.toString() || 'unknown',
        createdAt: new Date().toISOString(),
      };
      // dispatch(addTask(newTask));
      dispatch(addTaskAsync(newTask));
      //setTasks(prev => [...prev, newTask]);
      setSnackbar({ 
        open: true, 
        message: 'Task created successfully!', 
        severity: 'success' 
      });
      const notification = NotificationService.createTaskNotification(
        newTask.assigneeId,
        user?.id || '',
        newTask.id,
        newTask.title,
        'assigned'
      )
      sendNotification(notification);
    }
    
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    // dispatch(deleteTask(taskId));
    dispatch(deleteTaskAsync(taskId));
    //setTasks(prev => prev.filter(task => task.id !== taskId));
    setSnackbar({ 
      open: true, 
      message: 'Task deleted successfully!', 
      severity: 'success' 
    });
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

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Task Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {userRole === 'admin' && 'Create, assign, and manage all healthcare tasks'}
          {userRole === 'doctor' && 'View all tasks, reassign tasks, and manage consultations'}
          {userRole === 'nurse' && 'View your assigned tasks and update task statuses'}
        </Typography>
      </Box>

      
      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {userRole === 'nurse' ? 'My Tasks' : 'All Tasks'}
        </Typography>
        {canCreateTask && (
          <AddButton
          onClick={ handleAddTask }
          label='Create New Task'
          startIcon= {<Add />}
          ></AddButton>
        )}
      </Box>

      {/* Tasks Table */}
      <DataTable<Task>
        data={filteredTasks}
        columns={[
          {
            header: 'Task',
            render: (task) => (
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
            )
          },
          {
            header: 'Patient',
            render: (task) => (
              <Typography variant="body2">
                {getPatientName(task.patientId)}
              </Typography>
            )
          },
          {
            header: 'Assignee',
            render: (task) => (
              <Typography variant="body2">
                {getAssigneeName(task.assigneeId)}
              </Typography>
            )
          },
          {
            header: 'Status',
            render: (task) => (
              <Chip
                icon={getStatusIcon(task.status)}
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
                sx={{ fontWeight: 'bold', minWidth: 120 }}
              />
            )
          },
          {
            header: 'Due Date',
            render: (task) => (
              <Typography variant="body2" color="text.secondary">
                {formatDate(task.dueAt)}
              </Typography>
            )
          },
        ]}
        onView={handleViewTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        showEdit={canEditTask}
        showDelete={canDeleteTask}
        emptyMessage="No tasks available"
      />

      {/* Task Form Modal */}
      <TaskFormModal
        open={isModalOpen}
        mode={selectedTask ? 'edit' : 'create'}  
        role={userRole}
        taskId={selectedTask?.id}  
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        //onSave={handleTaskSave}
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
                <Chip
                  icon={getStatusIcon(taskToView.status)}
                  label={taskToView.status}
                  color={getStatusColor(taskToView.status)}
                  size="small"
                />
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
        //message={`Are you sure you want to delete the task "${taskToDelete?.title}"? This action cannot be undone and will remove all task data.`}
      />

      {/* Success/Error Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Layout>
  );
};

export default AdminTaskManagement;