// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as DepositIcon,
  Receipt as TransactionIcon,
  LocalGasStation as StationIcon,
  QrCode as QrCodeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Deposits', icon: <DepositIcon />, path: '/deposits' },
  { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions' },
  { text: 'Stations', icon: <StationIcon />, path: '/stations' },
  { text: 'QR Manager', icon: <QrCodeIcon />, path: '/qr-manager' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this for active route detection

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      const result = await logout();
      if (result.success) {
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false); // Close mobile drawer after navigation
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" noWrap fontWeight="bold">
          FUELPAY ADMIN
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={isActiveRoute(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Welcome back, {user?.email || 'Admin'}
          </Typography>
          
          <Tooltip title="Account settings">
            <IconButton 
              onClick={handleMenu} 
              color="inherit"
              sx={{ 
                border: '2px solid',
                borderColor: 'primary.main',
                p: 0.5
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: 3
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.displayName || 'Admin User'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}