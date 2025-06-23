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
import { useAuth } from '../context/AuthContext';

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
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    //setDrawerOpen(false);
    if (isMobile) setMobileOpen(false);
  };

  const drawerWidth = 280;
  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
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
          </Box>
          
          <List sx={{ pt: 2 }}>
            {drawerItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
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
          <IconButton 
            color="inherit" 
            edge="start" 
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
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
            <Typography variant="body2" sx={{ ml: 1, cursor: 'pointer' }}>
              {user?.name}
            </Typography>
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
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Role: <b>{user?.roleName?.toUpperCase()}</b>
                </Typography>
              </MenuItem>
              <Divider />
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
        /*sx={{
          '& .MuiDrawer-paper': {
            width: { md: drawerWidth },
            bgcolor: '#f8fafc',
            paddingTop: 8,
            flexShrink: { md: 0 },
          }
        }}*/
        aria-label="sidebar"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
         {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              paddingTop: 8,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>


      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4, 
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