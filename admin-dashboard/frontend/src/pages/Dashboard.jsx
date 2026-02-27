import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MetricCard from '../components/MetricCard';
import api from '../services/api';

const COLORS = ['#F5A623', '#E74C3C', '#5B9BD5', '#4CAF50', '#9C27B0', '#FF9800', '#607D8B'];

const STATUS_COLORS = {
  received: '#F5A623', under_review: '#E91E63', crew_dispatched: '#5B9BD5',
  in_progress: '#4CAF50', resolved: '#4CAF50', closed: '#888888',
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get('/dashboard/metrics').then((r) => setMetrics(r.data)).catch(console.error);
    api.get('/dashboard/charts').then((r) => setCharts(r.data)).catch(console.error);
    api.get('/dashboard/recent-activity').then((r) => setActivity(Array.isArray(r.data) ? r.data : [])).catch(console.error);
  }, []);

  if (!metrics) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard title="Total Reports" value={metrics.total} icon={<AssignmentIcon />} color="#5B9BD5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard title="Pending" value={metrics.pending} icon={<PendingActionsIcon />} color="#F5A623" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard title="In Progress" value={metrics.in_progress} icon={<BuildIcon />} color="#E91E63" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard title="Completed" value={metrics.completed} icon={<CheckCircleIcon />} color="#4CAF50" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard title="Avg Response" value={`${metrics.avg_response_hours}h`} icon={<AccessTimeIcon />} color="#9C27B0" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Reports by Category - Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Reports by Category</Typography>
              {charts?.by_category && (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={charts.by_category} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      outerRadius={100} label={({ name, value }) => `${name} (${value})`}>
                      {charts.by_category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Reports by Status - Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Reports by Status</Typography>
              {charts?.by_status && (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={charts.by_status}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {charts.by_status.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Recent Activity</Typography>
              <List dense>
                {activity.slice(0, 10).map((a) => (
                  <ListItem key={a.id} divider>
                    <ListItemText
                      primary={`Report #${a.report_id} — ${a.action.replace('_', ' ')}`}
                      secondary={`${a.user_name || 'System'} • ${new Date(a.timestamp).toLocaleString()}`}
                    />
                    {a.new_value && (
                      <Chip label={a.new_value} size="small"
                        sx={{ bgcolor: STATUS_COLORS[a.new_value] || '#888', color: '#fff', fontWeight: 600 }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
