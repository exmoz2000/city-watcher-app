import { Chip } from '@mui/material';

const STATUS_MAP = {
  received: { label: 'Received', color: '#F5A623' },
  under_review: { label: 'Under Review', color: '#E91E63' },
  crew_dispatched: { label: 'Dispatched', color: '#5B9BD5' },
  in_progress: { label: 'In Progress', color: '#2196F3' },
  resolved: { label: 'Resolved', color: '#4CAF50' },
  closed: { label: 'Closed', color: '#888888' },
};

const PRIORITY_MAP = {
  low: { label: 'Low', color: '#4CAF50' },
  medium: { label: 'Medium', color: '#F5A623' },
  high: { label: 'High', color: '#E74C3C' },
  critical: { label: 'Critical', color: '#D32F2F' },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: '#888' };
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.color, color: '#fff', fontWeight: 600 }} />;
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority] || { label: priority, color: '#888' };
  return <Chip label={p.label} size="small" variant="outlined" sx={{ borderColor: p.color, color: p.color, fontWeight: 600 }} />;
}

export const CATEGORY_LABELS = {
  pothole: 'Pothole', water_leak: 'Water Leak', power_outage: 'Power Outage',
  traffic_light: 'Traffic Light', street_light: 'Street Light', garbage: 'Garbage', other: 'Other',
};
