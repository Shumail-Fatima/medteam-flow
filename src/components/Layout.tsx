import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, List, ListItem, ListItemButton, Icon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';

const navigations = [
  { label: 'User Management', path: '/admin/user-management', icon: <Icon>User</Icon> },
  { label: 'Task Management', path: '/category/task-management', icon: <Icon>Task</Icon> },
  { label: 'Reports', path: '/category/reports', icon: <Icon>Report</Icon> },
  { label: 'Settings', path: '/category/settings', icon: <Icon>Settings</Icon> },
  { label: 'Support', path: '/category/support', icon: <Icon>Support</Icon> },
];
// This is a sidebar component that lists categories with links to different pages. change name of cateogry. can add icons in this

const sidebarWidth = 150;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >            {/* You can add logic for opening sidebar drawer on mobile here */}
            <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      {/* Main content area: sidebar + page content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: 0, sm: sidebarWidth },
            minWidth: { sm: sidebarWidth },
            height: 'calc(100vh - 64px)', // 64px is default AppBar height
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {/* Sidebar Title */}
          </Typography>
          <List>
            {navigations.map((navigation) => (
              <ListItem key={navigation.label} disablePadding>
                <ListItemButton>
                  <NavLink
                    to={navigation.path}
                    className={({ isActive }) =>
                      isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                  >
                    {navigation.label}
                  </NavLink>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          </Box>
        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            width: '100%',
            ml: { sm: `${sidebarWidth}px` },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
