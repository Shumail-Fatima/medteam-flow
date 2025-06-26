import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Layout from '../components/sharedComponents/Layout';
import usersData from '../data/Users.json'
import PatientFormModal from '../components/formModals/PatientRegisterFormModal';
import doctorSlots from '../data/DoctorSlots.json'


const doctors = usersData
    .filter((user: any) => user.roleId === 2)
    .map((user: any) => {
      const slotObj = doctorSlots.find(s => String(s.doctorId) === String(user.id));
      return{
      label: user.name,
      value: String(user.id),
      availableSlots: slotObj ? slotObj.slots : [],
      };
  });

const Appointment: React.FC = () => {
  const [modalOpen, setModelOpen] = useState(false);

  const handleOpenModal = () => setModelOpen(true);
  const handleCloseModal = () => setModelOpen(false);

  const handlePatientSubmit = (data: any) => {
  /* 1) What is the use of the data in handlePatientSubmit?
        The data parameter in handlePatientSubmit contains all the form values submitted from your PatientFormModal.
        This includes patient details, selected doctor, appointment slot, and reason for visit.
        Typical uses:
        Save the new patient and appointment to your backend or local state.
        Show a success message or notification.
        Update a list of appointments in your UI.
        For now, your code just closes the modal, but you can expand it to do any of the above. 
        Example: send data to backend or update state
        await api.createAppointment(data);
        */
    setModelOpen(false);
  };
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Appointment
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is the Appointment page.
        </Typography>
        <Button variant="contained" onClick={handleOpenModal}>
          Register Patient & Schedule Appointment
        </Button>
      </Box>
      <PatientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handlePatientSubmit}
        doctors={doctors}
      />
    </Layout>
  );
}

export default Appointment