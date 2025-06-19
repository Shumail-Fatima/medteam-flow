import { useState } from 'react';
import {
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Layout from '../components/Layout';
import usersData from '../data/Users.json';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>(
    usersData.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: String(u.roleId), // or map roleId to a role string if needed
    }))
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });

  const handleAddUser = () => {
    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { id, ...newUser }]);
    setNewUser({ name: '', email: '', role: '' });
    setAddDialogOpen(false);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <Layout>
      <Typography variant="h5" gutterBottom>User Management</Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setAddDialogOpen(true)}>
        Add User
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {/* For simplicity, edit not implemented yet */}
                  <Button color="error" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Role"
            fullWidth
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser}>Add</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminUserManagement;