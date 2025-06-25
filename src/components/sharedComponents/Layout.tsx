import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  //Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Support as SupportIcon,
  LocalHospital,
} from '@mui/icons-material';
import {Menu, MenuItem} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerItems = [
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/user-management' },
  { text: 'Task Management', icon: <AssignmentIcon />, path: '/task-management' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Support', icon: <SupportIcon />, path: '/support' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  //const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorE1, setAnchorE1] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorE1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  console.log('isMobile:', isMobile); // ← ADD THIS LINE

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorE1(event.currentTarget);
  }
  const handleMenuClose = () => {
    setAnchorE1(null);
  }

  //const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    //setDrawerOpen(false);
    if (isMobile) {setMobileOpen(false)}
  };

  const drawerWidth = 280;
  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
          {/* the head on the sidebar removed
          <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospital sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                MedCare Pro
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Admin Panel
            </Typography>
          </Box>*/}
          
          <List sx={{ pt: 5 }}>
            {drawerItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      }
                    },
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white',
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Sticky Logout at bottom
          tried to move the logout to the bottom of sidebar */}
          <Box sx={{ mt: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
  );

  const renderDrawer = () => {
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth, paddingTop: '80px' } }}
      >
        {drawerContent}
      </Drawer>
    );
  } else {
    return (
      <Drawer
        variant="permanent"
        open
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            top: 64,
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }
};

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1201,
          background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
        }}
      >
        <Toolbar>
          {isMobile &&(
          <IconButton 
            color="inherit" 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          )}
          <LocalHospital sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            MedCare Pro 
          </Typography>
          
          {/* from here till toolbar tag is for adding a dropdown/menu from the user 
          icon on header. also has logout as a menu option */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" sx={{ ml: 0, cursor: 'pointer' }}>
                {/*user?.name*/}
                {user && capitalize(user.name)}
              </Typography>
              <Typography variant="caption" color="text">
                {user?.roleName}
              </Typography>
            </Box>
            <Menu
              anchorEl={anchorE1}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer – Responsive */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
      {renderDrawer()}
      </Box>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: {xs: 2, md: 4}, 
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;