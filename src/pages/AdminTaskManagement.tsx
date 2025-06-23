import React, { useState } from 'react';
import { Button } from '@mui/material';
import TaskFormModal from '../components/TaskFormModal'; // adjust path if needed

function AdminTaskManagement() {
  const [open, setOpen] = useState(false);

  const handleSave = (task: any) => {
    console.log('✅ Task submitted:', task);
    setOpen(false);
  };

  const handleDelete = (taskId: string) => {
    console.log('🗑️ Task deleted:', taskId);
    setOpen(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open TaskFormModal
      </Button>

      <TaskFormModal
        open={open}
        mode="create"
        role="admin"
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default AdminTaskManagement;
