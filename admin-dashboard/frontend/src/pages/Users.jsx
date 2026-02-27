import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, Chip,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Switch, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../services/api';

const ROLES = ['super_admin', 'municipality_admin', 'department_manager', 'field_worker'];
const ROLE_COLORS = { super_admin: '#D32F2F', municipality_admin: '#F5A623', department_manager: '#5B9BD5', field_worker: '#4CAF50' };

const emptyForm = { email: '', first_name: '', last_name: '', role: 'field_worker', department: '', phone: '', password: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchUsers = useCallback(async () => {
    const params = { per_page: 100 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    const res = await api.get('/users', { params });
    setUsers(res.data.users);
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Auto-refresh every 10 seconds to detect new users
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (u) => {
    setForm({ email: u.email, first_name: u.first_name, last_name: u.last_name,
      role: u.role, department: u.department || '', phone: u.phone || '', password: '' });
    setEditId(u.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form };
    if (!data.password) delete data.password;
    if (editId) await api.put(`/users/${editId}`, data);
    else await api.post('/users', data);
    setDialogOpen(false);
    fetchUsers();
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u.id}/status`, { is_active: !u.is_active });
    fetchUsers();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#e09517' } }}>
          Add User
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Municipality</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell><Typography fontWeight={600}>{u.first_name} {u.last_name}</Typography></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role.replace('_', ' ')} size="small"
                      sx={{ bgcolor: ROLE_COLORS[u.role] || '#888', color: '#fff', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{u.department || '—'}</TableCell>
                  <TableCell>{u.municipality_name || '—'}</TableCell>
                  <TableCell>
                    <Switch checked={u.is_active} size="small" onChange={() => toggleActive(u)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={6}>
              <TextField fullWidth size="small" label="First Name" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label="Last Name" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth size="small" label="Email" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editId} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label="Department" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth size="small" label={editId ? 'New Password' : 'Password'} type="password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#e09517' } }}>
            {editId ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
