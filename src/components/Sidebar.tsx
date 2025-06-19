// components/Sidebar.tsx

import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const categories = [  
  { label: 'User Management', path: '/admin/user-management' },
  { label: 'Task Management', path: '/category/task-management' },
  { label: 'Reports', path: '/category/reports' },
  { label: 'Settings', path: '/category/settings' },
  { label: 'Support', path: '/category/support' },
];
// This is a sidebar component that lists categories with links to different pages.

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: 250,
        height: '100vh',
        bgcolor: 'primary.main', // MUI theme primary color (usually blue)
        color: 'white',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Categories
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category.label} disablePadding>
            <ListItemButton>
              <NavLink
                    to={category.path}
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                    >
                    {category.label}
                </NavLink>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
