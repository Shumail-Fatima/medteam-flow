import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Layout from '../components/sharedComponents/Layout';
import DataTable from '../components/sharedComponents/DataTable';
import CustomTabs, { type TabOption } from '../components/GeneralizedTabs';
import PatientFormModal from '../components/formModals/PatientFormModal';
import ConfirmDeleteDialog from '../components/sharedComponents/ConfirmDeleteDialog';
import SnackbarAlert from '../components/sharedComponents/SnackbarAlert';

import appointmentsData from '../data/Appointments.json';
import usersData from '../data/Users.json';
import doctorSlots from '../data/DoctorSlots.json';

// Prepare doctors array
const doctors = usersData
  .filter((user: any) => user.roleId === 2)
  .map((user: any) => {
    const slotObj = doctorSlots.find((s: any) => String(s.doctorId) === String(user.id));
    return {
      label: user.name,
      value: String(user.id),
      availableSlots: slotObj ? slotObj.slots : [],
    };
  });

const tabOptions: TabOption[] = [
  { label: 'Appointments' },
  { label: 'Create Appointment' }
];

const Appointment: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState<any[]>(appointmentsData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Tab change handler
  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  // View patient details (open modal in view mode)
  const handleViewPatient = (appointment: any) => {
    setSelectedAppointment(appointment);
    setModalMode('view');
    setModalOpen(true);
  };

  // Edit appointment (open modal in edit mode)
  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Delete appointment
  const handleDelete = (appointment: any) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      setSnackbar({ open: true, message: 'Appointment deleted.', severity: 'success' });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Create or update appointment
  const handlePatientSubmit = (data: any) => {
    if (modalMode === 'edit') {
      setAppointments(prev =>
        prev.map(a => a.id === selectedAppointment.id ? { ...a, ...data } : a)
      );
      setSnackbar({ open: true, message: 'Appointment updated.', severity: 'success' });
    } else if (modalMode === 'create') {
      const newAppointment = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        patientName: data.name,
        doctorName: doctors.find(d => d.value === data.doctorId)?.label || '',
      };
      setAppointments(prev => [...prev, newAppointment]);
      setSnackbar({ open: true, message: 'Appointment created.', severity: 'success' });
    }
    setModalOpen(false);
    setSelectedAppointment(null);
    setTab(0); // Switch to listing tab after create/edit
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and schedule patient appointments
        </Typography>
      </Box>

      <CustomTabs value={tab} onChange={handleTabChange} tabs={tabOptions} />

      {tab === 0 && (
        <Box>
          <Button
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => {
              setSelectedAppointment(null);
              setModalMode('create');
              setModalOpen(true);
              setTab(1);
            }}
          >
            New Appointment
          </Button>
          <DataTable
            data={appointments}
            columns={[
              { header: 'Patient', render: (a: any) => a.patientName },
              { header: 'Doctor', render: (a: any) => a.doctorName },
              { header: 'Appointment Date', render: (a: any) => new Date(a.appointmentSlot).toLocaleString() },
              { header: 'Created At', render: (a: any) => new Date(a.createdAt).toLocaleString() },
            ]}
            onView={handleViewPatient}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showEdit={() => true}
            showDelete={() => true}
          />
        </Box>
      )}

      {/* Patient Form Modal for create, edit, view */}
      <PatientFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedAppointment(null); }}
        onSubmit={handlePatientSubmit}
        doctors={doctors}
        initialValues={selectedAppointment ? {
          name: selectedAppointment.name || selectedAppointment.patientName || '',
          email: selectedAppointment.email || '',
          phone: selectedAppointment.phone || '',
          doctorId: selectedAppointment.doctorId || '',
          appointmentSlot: selectedAppointment.appintmentSlot || '',
          reason: selectedAppointment.reason || '',
        }
        :{}}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        itemName={appointmentToDelete?.patientName || ''}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Snackbar for feedback */}
      <SnackbarAlert
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Layout>
  );
};

export default Appointment;