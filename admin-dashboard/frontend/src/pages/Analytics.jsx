import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../services/api';

const COLORS = ['#F5A623', '#E74C3C', '#5B9BD5', '#4CAF50', '#9C27B0', '#FF9800', '#607D8B'];
const CATEGORY_COLORS = {
  pothole: '#F5A623', water_leak: '#5B9BD5', power_outage: '#E74C3C',
  traffic_light: '#9C27B0', street_light: '#FF9800', garbage: '#4CAF50', other: '#607D8B',
};

export default function Analytics() {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [deptPerf, setDeptPerf] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [categoryTrends, setCategoryTrends] = useState([]);

  const dateParams = useCallback(() => {
    const params = {};
    if (startDate) params.start_date = startDate.toISOString();
    if (endDate) params.end_date = endDate.toISOString();
    return params;
  }, [startDate, endDate]);

  useEffect(() => {
    const params = dateParams();
    api.get('/analytics/trends', { params: { days: 30, ...params } }).then((r) => setTrends(r.data));
    api.get('/analytics/categories', { params }).then((r) => setCategories(r.data));
    api.get('/analytics/performance', { params }).then((r) => setPerformance(r.data));
    api.get('/analytics/department-performance', { params }).then((r) => setDeptPerf(r.data));
    api.get('/analytics/ward-breakdown', { params }).then((r) => setWardData(r.data));
  }, [dateParams]);

  // Build category trends from the main trends data grouped by category
  useEffect(() => {
    const params = dateParams();
    api.get('/analytics/categories', { params }).then((r) => {
      setCategoryTrends(r.data);
    });
  }, [dateParams]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Date Range Picker */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="h6" fontWeight={600}>Analytics</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <DatePicker label="Start Date" value={startDate}
                onChange={(v) => setStartDate(v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <DatePicker label="End Date" value={endDate}
                onChange={(v) => setEndDate(v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </Grid>
          </Grid>
        </Card>

        {/* Performance Summary */}
        {performance && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary">Total Reports</Typography>
                  <Typography variant="h4" fontWeight={700}>{performance.total_reports}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary">Resolved</Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">{performance.resolved_reports}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary">Resolution Rate</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">{performance.resolution_rate}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2}>
          {/* Trends Line Chart */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Report Trends (30 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown Pie */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Category Breakdown</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%"
                      outerRadius={110} label={({ category, count }) => `${category} (${count})`}>
                      {categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Department Performance Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Department Performance</Typography>
                <Box sx={{ height: 320 }}>
                  {deptPerf.length > 0 ? (
                    <ResponsiveBar
                      data={deptPerf}
                      keys={['resolution_rate']}
                      indexBy="department"
                      margin={{ top: 10, right: 20, bottom: 60, left: 60 }}
                      padding={0.3}
                      colors={['#4CAF50']}
                      axisBottom={{ tickRotation: -30 }}
                      axisLeft={{ legend: 'Resolution Rate %', legendPosition: 'middle', legendOffset: -50 }}
                      labelFormat={(v) => `${v}%`}
                      tooltip={({ data }) => (
                        <Box sx={{ bgcolor: 'white', p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                          <Typography variant="body2"><strong>{data.department}</strong></Typography>
                          <Typography variant="caption">Rate: {data.resolution_rate}% ({data.resolved}/{data.total})</Typography>
                        </Box>
                      )}
                    />
                  ) : (
                    <Typography color="text.secondary" sx={{ pt: 10, textAlign: 'center' }}>No data</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ward Breakdown Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Ward Breakdown</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={wardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ward" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#5B9BD5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Trends (multi-line using category data as bar chart) */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Category Trends</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F5A623">
                      {categoryTrends.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.category] || COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
