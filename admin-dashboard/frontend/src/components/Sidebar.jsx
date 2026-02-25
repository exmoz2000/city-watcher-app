import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import SpeedIcon from '@mui/icons-material/Speed';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssignmentIcon /> },
  { label: 'Map', path: '/map', icon: <MapIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChartIcon /> },
  { label: 'SLA', path: '/sla', icon: <SpeedIcon /> },
];

export default function Sidebar({ open, onClose, variant = 'permanent' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#F5A623' }}>
          🏙️ CityWatcher
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Admin Dashboard
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => { navigate(item.path); onClose?.(); }}
            sx={{
              mx: 1, borderRadius: 2, mb: 0.5,
              '&.Mui-selected': { bgcolor: 'rgba(245,166,35,0.12)', color: '#F5A623',
                '& .MuiListItemIcon-root': { color: '#F5A623' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {content}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
