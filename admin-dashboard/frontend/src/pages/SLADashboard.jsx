import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MetricCard from '../components/MetricCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = ['pothole', 'water_leak', 'power_outage', 'traffic_light', 'street_light', 'garbage', 'other'];
const CATEGORY_LABELS = {
  pothole: 'Pothole', water_leak: 'Water Leak', power_outage: 'Power Outage',
  traffic_light: 'Traffic Light', street_light: 'Street Light', garbage: 'Garbage', other: 'Other',
};

export default function SLADashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [configDialog, setConfigDialog] = useState(false);
  const [editConfig, setEditConfig] = useState(null);
  const [form, setForm] = useState({ category: '', response_hours: '', warning_threshold_pct: 75 });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const isAdmin = user && ['super_admin', 'municipality_admin'].includes(user.role);

  const fetchDashboard = () => {
    api.get('/sla/dashboard').then((r) => setDashboard(r.data));
  };
  const fetchConfigs = () => {
    api.get('/sla/config').then((r) => setConfigs(r.data));
  };

  useEffect(() => { fetchDashboard(); fetchConfigs(); }, []);

  const handleSaveConfig = async () => {
    try {
      const payload = {
        category: form.category,
        response_hours: parseInt(form.response_hours),
        warning_threshold_pct: parseInt(form.warning_threshold_pct),
        municipality_id: user.municipality_id,
      };
      if (editConfig) {
        await api.put(`/sla/config/${editConfig.id}`, payload);
        setToast({ open: true, message: 'Config updated', severity: 'success' });
      } else {
        await api.post('/sla/config', payload);
        setToast({ open: true, message: 'Config created', severity: 'success' });
      }
      setConfigDialog(false);
      setEditConfig(null);
      setForm({ category: '', response_hours: '', warning_threshold_pct: 75 });
      fetchConfigs();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.error || 'Failed', severity: 'error' });
    }
  };

  const handleDeleteConfig = async (id) => {
    try {
      await api.delete(`/sla/config/${id}`);
      setToast({ open: true, message: 'Config deleted', severity: 'success' });
      fetchConfigs();
    } catch {
      setToast({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const openEdit = (config) => {
    setEditConfig(config);
    setForm({
      category: config.category,
      response_hours: config.response_hours,
      warning_threshold_pct: config.warning_threshold_pct,
    });
    setConfigDialog(true);
  };

  const openCreate = () => {
    setEditConfig(null);
    setForm({ category: '', response_hours: '', warning_threshold_pct: 75 });
    setConfigDialog(true);
  };

  const timeSince = (deadline) => {
    const diff = Date.now() - new Date(deadline).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h overdue`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h overdue`;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>SLA Dashboard</Typography>

      {/* Metric Cards */}
      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricCard title="Breached" value={dashboard.breached.length}
              icon={<ErrorIcon />} color="#E74C3C" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricCard title="At Risk" value={dashboard.at_risk.length}
              icon={<WarningIcon />} color="#F5A623" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricCard title="On Track" value={dashboard.on_track.length}
              icon={<CheckCircleIcon />} color="#4CAF50" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <MetricCard title="Compliance Rate" value={`${dashboard.compliance_rate}%`}
              icon={<SpeedIcon />} color="#5B9BD5" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Breached Reports */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="error" sx={{ mb: 1 }}>
                Breached Reports ({dashboard?.breached.length || 0})
              </Typography>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report #</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Overdue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboard?.breached || []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.report_number}</TableCell>
                        <TableCell>{CATEGORY_LABELS[r.category] || r.category}</TableCell>
                        <TableCell>{r.sla_deadline ? new Date(r.sla_deadline).toLocaleString() : '—'}</TableCell>
                        <TableCell>
                          <Chip label={r.sla_deadline ? timeSince(r.sla_deadline) : '—'} size="small" color="error" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!dashboard?.breached || dashboard.breached.length === 0) && (
                      <TableRow><TableCell colSpan={4} align="center">No breached reports</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* At Risk Reports */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="warning.main" sx={{ mb: 1 }}>
                At Risk Reports ({dashboard?.at_risk.length || 0})
              </Typography>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report #</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboard?.at_risk || []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.report_number}</TableCell>
                        <TableCell>{CATEGORY_LABELS[r.category] || r.category}</TableCell>
                        <TableCell>{r.sla_deadline ? new Date(r.sla_deadline).toLocaleString() : '—'}</TableCell>
                        <TableCell><Chip label={r.status?.replace('_', ' ')} size="small" color="warning" /></TableCell>
                      </TableRow>
                    ))}
                    {(!dashboard?.at_risk || dashboard.at_risk.length === 0) && (
                      <TableRow><TableCell colSpan={4} align="center">No at-risk reports</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SLA Configuration Management - Admin only */}
      {isAdmin && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>SLA Configurations</Typography>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
                Add Config
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Response Hours</TableCell>
                    <TableCell>Warning Threshold</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{CATEGORY_LABELS[c.category] || c.category}</TableCell>
                      <TableCell>{c.response_hours}h</TableCell>
                      <TableCell>{c.warning_threshold_pct}%</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteConfig(c.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {configs.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No SLA configs</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Config Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editConfig ? 'Edit SLA Config' : 'New SLA Config'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl fullWidth size="small" disabled={!!editConfig}>
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category"
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Response Hours" type="number" size="small" fullWidth
            value={form.response_hours}
            onChange={(e) => setForm({ ...form, response_hours: e.target.value })} />
          <TextField label="Warning Threshold %" type="number" size="small" fullWidth
            value={form.warning_threshold_pct}
            onChange={(e) => setForm({ ...form, warning_threshold_pct: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveConfig}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
