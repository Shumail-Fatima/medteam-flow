import React, { useCallback, useEffect } from 'react';
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
  Badge,
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
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import {Menu, MenuItem} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rolePages } from '../RolePages';
import { useState } from 'react';
// import { useNotificationSocket } from '../../context/NotifSocketContext';
import { useNotification } from '../../context/NotifSocketContext';
import { createNotificationChannel } from '../../utils/NotificationChannel';
import { useNotificationListener } from '../../hooks/useNotifListen';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  //const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  //const drawerItems = user ? rolePages[user.roleName as keyof typeof rolePages] || [] : [];
  const drawerItems = user ? rolePages[user.roleName as keyof typeof rolePages] || [] : [];
  const [anchorE1, setAnchorE1] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorE1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);
  const notifOpen = Boolean(notifAnchorEl);
  //const { notifications, markAsRead, getUnreadCount } = useNotification();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Real-time notification receiving logic
  useEffect(() => {
    const channel = createNotificationChannel();

    channel.onmessage = (event) => {
      setNotifications((prev) => [event.data, ...prev]);
      
      // Optional: Play notification sound for new notifications
      // You can uncomment this if you want audio feedback
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(e => console.log('Audio play failed:', e));
    };

    return () => {
      channel.close();
    };
  }, []);

  // Fetch initial notifications when user is available
  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:8000/Notifications?toUserId=${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(error => console.error('Error fetching initial notifications:', error));
    }
  }, [user?.id]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorE1(event.currentTarget);
  }
  const handleMenuClose = () => {
    setAnchorE1(null);
  }

    


  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    
    // Fetch existing notifications from server
    if (user?.id) {
      fetch(`http://localhost:8000/Notifications?toUserId=${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(error => console.error('Error fetching notifications:', error));
    }
  }

  //const handleNotifClick = (e: React.MouseEvent<HTMLElement>) => setNotifAnchorEl(e.currentTarget);

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  }

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    // Update UI immediately
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );

    // Update server
    Promise.all(
      unreadNotifications.map(n =>
        fetch(`http://localhost:8000/Notifications/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
      )
    ).catch(error => console.error('Error marking all notifications as read:', error));
  };

  // In your Layout or Notification component
// const ws = useNotificationSocket();
// useEffect(() => {
//   if (!ws) return;
//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     if (user && data.type === 'notification' && data.toUserId === user.id) {
//       setNotifications((prev) => [data.payload, ...prev]);
//     }
//   };
// }, [ws, user]);
  

  //const unreadCount = getUnreadCount();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationPath = (notif: any) => {

  switch (notif.type) {
    case 'appointment':
      return notif.appointmentId ? `/Appointment/${notif.appointmentId}` : '/Appointment';
    case 'consultation':
      return notif.consultationId ? `/consultation/view/${notif.consultationId}` : '/consultations-records';
    case 'task':
      return '/task-management';
    case 'followup':
      return notif.patientId ? `/patients/${notif.patientId}` : '/patients';
    default:
      return '/';
  }
};

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

  function isSidebarSelected(itemPath: string, locationPath: string) {
    if (itemPath === '/Appointment') return locationPath === '/Appointment' || (locationPath.startsWith('/consultation') && !locationPath.startsWith('/consultation-records') && !locationPath.startsWith('/consultations') && !locationPath.startsWith('/consultation/view'));
    if (itemPath === '/consultations-records') return locationPath === '/consultations-records' || locationPath.startsWith('/consultation/view');
    if (itemPath === '/patients') return locationPath === '/patients' || locationPath.startsWith('/patients/');
    return locationPath === itemPath;
  }

  const drawerWidth = 280;
  const drawerContent = (
    <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
          
          <List sx={{ pt: 5, flexGrow: 1 }}>
            {drawerItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ px: 1, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isSidebarSelected(item.path, location.pathname)}
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
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Sticky Logout at bottom */}
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
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth, paddingTop: '80px', display: 'flex', flexDirection: 'column' } }}
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
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }
};

  const headerBar = () => {
    return(
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
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {/* {unreadCount > 0 && ( */}
              <Badge badgeContent={unreadCount} color="error" >
                <IconButton 
                  onClick={handleNotifClick}
                  sx={{
                    ...(unreadCount > 0 && {
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                        },
                        '50%': {
                          transform: 'scale(1.1)',
                        },
                        '100%': {
                          transform: 'scale(1)',
                        },
                      },
                    }),
                  }}
                >
                  <NotificationsIcon htmlColor='rgb(254 254 254 / 87%)' />
                </IconButton>
              </Badge>
          {/* )} */}
          </Box>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" sx={{ ml: 0, cursor: 'pointer', lineHeight: 0.5, mt: 1}}>
                {/*user?.name*/}
                {user && capitalize(user.name)}
              </Typography>
              <Typography variant="caption" color="text"
                  sx={{
                    lineHeight: 0,
                    mt: '1px',
                  }}>
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

<Menu
  anchorEl={notifAnchorEl}
  open={Boolean(notifAnchorEl)}
  onClose={handleNotifClose}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
  PaperProps={{
    sx: {
      maxHeight: 400,
      width: 350,
    }
  }}
>
  {notifications.length === 0 ? (
    <MenuItem disabled>No notifications</MenuItem>
  ) : (
    <>
      {unreadCount > 0 && (
        <MenuItem onClick={handleMarkAllAsRead} sx={{ justifyContent: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="primary">Mark all as read</Typography>
        </MenuItem>
      )}
      {notifications.map((notif) => (
        <MenuItem 
          key={notif.id} 
          onClick={(e) => {e.stopPropagation();
            
            handleNotifClose();
            
            // Mark as read in UI
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notif.id ? { ...n, isRead: true } : n
              )
            );

            // Persist to mock server
            fetch(`http://localhost:8000/Notifications/${notif.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true }),
            }).catch(error => console.error('Error marking notification as read:', error));
            
            navigate(getNotificationPath(notif));
          }}
          sx={{
            bgcolor: !notif.isRead ? 'action.hover' : 'transparent',
            borderLeft: !notif.isRead ? 3 : 0,
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: !notif.isRead ? 'bold' : 'normal',
                color: !notif.isRead ? 'text.primary' : 'text.secondary'
              }}
            >
              {notif.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {notif.message}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {new Date(notif.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </>
  )}
</Menu>

          </Box>
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      
      {headerBar()}

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
          p: {xs: 2, md: 8}, 
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