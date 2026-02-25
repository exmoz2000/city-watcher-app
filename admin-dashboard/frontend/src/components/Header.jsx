import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar,
  Menu, MenuItem, Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import api from '../services/api';
import { DRAWER_WIDTH } from './Sidebar';

const pageTitles = {
  '/': 'Dashboard',
  '/reports': 'Reports',
  '/users': 'Users',
  '/analytics': 'Analytics',
};

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    api.get('/notifications').then((r) => setUnread(r.data.unread_count)).catch(() => {});
  }, [location.pathname]);

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/reports/') ? 'Report Detail' : 'Dashboard');

  return (
    <AppBar position="fixed" color="inherit" elevation={1}
      sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{title}</Typography>

        <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton sx={{ mr: 1 }}>
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#F5A623', fontSize: 14, mr: 1 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.first_name} {user?.last_name}
          </Typography>
        </Box>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">{user?.role?.replace('_', ' ')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
