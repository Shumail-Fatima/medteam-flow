import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Assignment,
  Schedule,
  CheckCircle,
  Pending,
  PlayArrow,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import TaskFormModal from '../components/TaskFormModal';
import DataTable from '../components/sharedComponents/DataTable';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';
import type { Task, TaskFormData, Patient, TaskUser } from '../types/task';
import { useAuth } from '../context/AuthContext';
import dummyData from '../data/dummy-data.json';

const AdminTaskManagement: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.roleName as 'admin' | 'doctor' | 'nurse';

  // Initialize tasks with proper typing
  const [tasks, setTasks] = useState<Task[]>(
    dummyData.tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
    }))
  );

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

  // Helper functions
  const getPatientName = (patientId: string) => {
    const patient = dummyData.patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getAssigneeName = (assigneeId: string) => {
    const assignee = dummyData.users.find(u => u.id === assigneeId);
    return assignee?.name || 'Unknown User';
  };

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

  const handleTaskSave = (taskData: TaskFormData) => {
    if (selectedTask) {
      // Edit existing task
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id 
          ? { ...task, ...taskData, createdBy: task.createdBy }
          : task
      ));
      setSnackbar({ 
        open: true, 
        message: 'Task updated successfully!', 
        severity: 'success' 
      });
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}`,
        createdBy: user?.id?.toString() || 'unknown',
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      setSnackbar({ 
        open: true, 
        message: 'Task created successfully!', 
        severity: 'success' 
      });
    }
    
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
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

      {/* Stats Cards 
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.totalTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.pendingTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Pending />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {stats.inProgressTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <PlayArrow />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      */}

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {userRole === 'nurse' ? 'My Tasks' : 'All Tasks'}
        </Typography>
        {canCreateTask && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTask}
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
            }}
          >
            Create New Task
          </Button>
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
      />

      {/* Task Form Modal */}
      <TaskFormModal
        open={isModalOpen}
        mode={selectedTask ? 'edit' : 'create'}  //target
        role={userRole}
        taskId={selectedTask?.id}  //target
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        //onSave={handleTaskSave}
        onSubmit={handleTaskSave}
        onDelete={handleTaskDelete}
      />

      {/* View Task Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Task Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {taskToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {taskToView.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
              </Box>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Patient
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getPatientName(taskToView.patientId)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assigned To
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getAssigneeName(taskToView.assigneeId)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(taskToView.dueAt)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {taskToView.notes || 'No notes provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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