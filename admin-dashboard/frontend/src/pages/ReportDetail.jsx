import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Divider, Button,
  Select, MenuItem, FormControl, InputLabel, TextField, List, ListItem,
  ListItemText, Chip, IconButton, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { StatusBadge, PriorityBadge, CATEGORY_LABELS } from '../components/StatusBadge';
import api from '../services/api';

const ALL_STATUSES = ['received', 'under_review', 'crew_dispatched', 'in_progress', 'resolved', 'closed'];

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [users, setUsers] = useState([]);
  const [assignTo, setAssignTo] = useState('');

  useEffect(() => {
    api.get(`/reports/${id}`).then((r) => {
      setReport(r.data);
      setNewStatus(r.data.status);
      setAssignTo(r.data.assigned_to || '');
    });
    api.get('/users?per_page=100').then((r) => setUsers(r.data.users));
  }, [id]);

  const updateStatus = async () => {
    await api.patch(`/reports/${id}/status`, { status: newStatus });
    const r = await api.get(`/reports/${id}`);
    setReport(r.data);
  };

  const assignReport = async () => {
    await api.patch(`/reports/${id}/assign`, { assigned_to: assignTo || null });
    const r = await api.get(`/reports/${id}`);
    setReport(r.data);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await api.post(`/reports/${id}/comments`, { comment_text: comment, is_internal: true });
    setComment('');
    const r = await api.get(`/reports/${id}`);
    setReport(r.data);
  };

  if (!report) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reports')} sx={{ mb: 2 }}>
        Back to Reports
      </Button>

      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700}>{report.report_number}</Typography>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
            <Chip label={CATEGORY_LABELS[report.category] || report.category} variant="outlined" />
          </Box>
          <Typography variant="h6" sx={{ mt: 1 }}>{report.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{report.description}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Photos ({report.attachments.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {report.attachments.map((att) => (
                    <Box
                      key={att.id}
                      component="img"
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/reports/attachments/${att.file_path}`}
                      alt="Report attachment"
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/reports/attachments/${att.file_path}`, '_blank')}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Location
              </Typography>
              <Typography>{report.location_address}</Typography>
              <Typography variant="caption" color="text.secondary">
                {report.location_lat?.toFixed(5)}, {report.location_lng?.toFixed(5)} • {report.ward}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                <PersonIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Citizen Info
              </Typography>
              <Typography>{report.citizen_name}</Typography>
              <Typography variant="body2" color="text.secondary">{report.citizen_phone}</Typography>
              <Typography variant="body2" color="text.secondary">{report.citizen_email}</Typography>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Actions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)}>
                    {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" size="small" onClick={updateStatus}
                  disabled={newStatus === report.status}
                  sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#e09517' } }}>
                  Update
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Assign To</InputLabel>
                  <Select value={assignTo} label="Assign To" onChange={(e) => setAssignTo(e.target.value)}>
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="outlined" size="small" onClick={assignReport}>Assign</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline & Comments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Status Timeline</Typography>
              <List dense>
                {report.history?.map((h) => (
                  <ListItem key={h.id} divider>
                    <ListItemText
                      primary={h.action.replace('_', ' ')}
                      secondary={`${h.user_name || 'System'} • ${new Date(h.timestamp).toLocaleString()}`}
                    />
                    {h.new_value && <Chip label={h.new_value} size="small" />}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Comments</Typography>
              <List dense>
                {report.comments?.map((c) => (
                  <ListItem key={c.id} divider>
                    <ListItemText
                      primary={c.comment_text}
                      secondary={`${c.user_name} • ${new Date(c.created_at).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" fullWidth placeholder="Add a comment..."
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                <Button variant="contained" size="small" onClick={addComment}
                  sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#e09517' } }}>
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
