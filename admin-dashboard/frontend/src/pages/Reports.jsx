import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TextField, Select, MenuItem, FormControl, InputLabel, Typography,
  IconButton, InputAdornment, Grid, Checkbox, Button, Toolbar, Snackbar, Alert, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StatusBadge, PriorityBadge, CATEGORY_LABELS } from '../components/StatusBadge';
import api from '../services/api';

const STATUSES = ['', 'received', 'under_review', 'crew_dispatched', 'in_progress', 'resolved', 'closed'];
const CATEGORIES = ['', 'pothole', 'water_leak', 'power_outage', 'traffic_light', 'street_light', 'garbage', 'other'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const ALL_STATUSES = ['received', 'under_review', 'crew_dispatched', 'in_progress', 'resolved', 'closed'];
const ALL_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchReports = useCallback(async () => {
    const params = { page: page + 1, per_page: perPage };
    if (search) params.search = search;
    if (status) params.status = status;
    if (category) params.category = category;
    if (priority) params.priority = priority;
    const res = await api.get('/reports', { params });
    setReports(res.data.reports);
    setTotal(res.data.total);
  }, [page, perPage, search, status, category, priority]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { api.get('/users').then((r) => setUsers(r.data.users || r.data)); }, []);

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? reports.map((r) => r.id) : []);
  };

  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleStatusChange = async (reportId, newStatus, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/reports/${reportId}/status`, { status: newStatus });
      setToast({ open: true, message: 'Status updated', severity: 'success' });
      fetchReports();
    } catch {
      setToast({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handlePriorityChange = async (reportId, newPriority, e) => {
    e.stopPropagation();
    try {
      await api.put(`/reports/${reportId}`, { priority: newPriority });
      setToast({ open: true, message: 'Priority updated', severity: 'success' });
      fetchReports();
    } catch {
      setToast({ open: true, message: 'Failed to update priority', severity: 'error' });
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || !bulkValue || selected.length === 0) return;
    try {
      const res = await api.post('/reports/bulk', {
        report_ids: selected,
        action: bulkAction,
        value: bulkValue,
      });
      setToast({ open: true, message: `Updated ${res.data.count} reports`, severity: 'success' });
      setSelected([]);
      setBulkAction('');
      setBulkValue('');
      fetchReports();
    } catch {
      setToast({ open: true, message: 'Bulk action failed', severity: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (search) params.search = search;
      const res = await api.get('/reports/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth size="small" placeholder="Search reports..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s ? s.replace('_', ' ') : 'All'}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c ? CATEGORY_LABELS[c] : 'All'}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => { setPriority(e.target.value); setPage(0); }}>
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p || 'All'}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport} size="small">
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Bulk Action Toolbar */}
      {selected.length > 0 && (
        <Card sx={{ p: 1.5, mb: 2, bgcolor: 'primary.50' }}>
          <Toolbar variant="dense" disableGutters sx={{ gap: 2, minHeight: 'auto' }}>
            <Typography variant="body2" fontWeight={600}>{selected.length} selected</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Action</InputLabel>
              <Select value={bulkAction} label="Action" onChange={(e) => { setBulkAction(e.target.value); setBulkValue(''); }}>
                <MenuItem value="status">Change Status</MenuItem>
                <MenuItem value="assign">Assign To</MenuItem>
              </Select>
            </FormControl>
            {bulkAction === 'status' && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={bulkValue} label="Status" onChange={(e) => setBulkValue(e.target.value)}>
                  {STATUSES.filter(Boolean).map((s) => (
                    <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {bulkAction === 'assign' && (
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>User</InputLabel>
                <Select value={bulkValue} label="User" onChange={(e) => setBulkValue(e.target.value)}>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button variant="contained" size="small" onClick={handleBulkApply}
              disabled={!bulkAction || !bulkValue}>
              Apply
            </Button>
            <Button size="small" onClick={() => setSelected([])}>Clear</Button>
          </Toolbar>
        </Card>
      )}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < reports.length}
                    checked={reports.length > 0 && selected.length === reports.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Report #</TableCell>
                <TableCell>Photo</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id} hover
                  selected={selected.includes(r.id)}>
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(r.id)} onChange={() => handleSelect(r.id)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{r.report_number}</Typography>
                  </TableCell>
                  <TableCell>
                    {r.attachment_count > 0 ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Yes"
                        size="small"
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    ) : (
                      <Chip
                        label="No"
                        size="small"
                        variant="outlined"
                        sx={{ color: 'text.secondary', borderColor: 'text.secondary' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[r.category] || r.category}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.location_address}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value, e)}
                      size="small"
                      sx={{
                        minWidth: 140,
                        bgcolor: r.status === 'received' ? '#FFA726' :
                                 r.status === 'under_review' ? '#42A5F5' :
                                 r.status === 'crew_dispatched' ? '#AB47BC' :
                                 r.status === 'in_progress' ? '#FFCA28' :
                                 r.status === 'resolved' ? '#66BB6A' :
                                 r.status === 'closed' ? '#78909C' : 'transparent',
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      {ALL_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={r.priority}
                      onChange={(e) => handlePriorityChange(r.id, e.target.value, e)}
                      size="small"
                      sx={{
                        minWidth: 100,
                        bgcolor: r.priority === 'critical' ? '#EF5350' :
                                 r.priority === 'high' ? '#FF9800' :
                                 r.priority === 'medium' ? '#FDD835' :
                                 r.priority === 'low' ? '#66BB6A' : 'transparent',
                        color: r.priority === 'medium' ? '#000' : 'white',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSvgIcon-root': { color: r.priority === 'medium' ? '#000' : 'white' }
                      }}
                    >
                      {ALL_PRIORITIES.map((p) => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{r.assignee_name || '—'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate(`/reports/${r.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page} rowsPerPage={perPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25, 50]}
        />
      </Card>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}
