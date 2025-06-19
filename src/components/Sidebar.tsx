// components/Sidebar.tsx

import { Box, Icon, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const categories = [
  { label: 'User Management', path: '/admin/user-management', icon: <Icon>User</Icon> },
  { label: 'Task Management', path: '/category/task-management', icon: <Icon>Task</Icon> },
  { label: 'Reports', path: '/category/reports', icon: <Icon>Report</Icon> },
  { label: 'Settings', path: '/category/settings', icon: <Icon>Settings</Icon> },
  { label: 'Support', path: '/category/support', icon: <Icon>Support</Icon> },
];
// This is a sidebar component that lists categories with links to different pages. change name of cateogry. can add icons in this

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
