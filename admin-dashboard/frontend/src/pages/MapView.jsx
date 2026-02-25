import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, FormControl, InputLabel, Select, MenuItem, Typography, Button,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.heat';
import { StatusBadge, CATEGORY_LABELS } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = {
  received: '#F5A623',
  under_review: '#E91E63',
  crew_dispatched: '#5B9BD5',
  in_progress: '#2196F3',
  resolved: '#4CAF50',
  closed: '#888888',
};

// Municipality center coordinates for auto-zoom
const MUNICIPALITY_CENTERS = {
  'City of Cape Town': { lat: -33.93, lng: 18.42, zoom: 12 },
  'eThekwini Municipality (Durban)': { lat: -29.85, lng: 31.02, zoom: 12 },
  'City of Johannesburg': { lat: -26.15, lng: 28.05, zoom: 12 },
};

const STATUSES = ['', 'received', 'under_review', 'crew_dispatched', 'in_progress', 'resolved', 'closed'];
const CATEGORIES = ['', 'pothole', 'water_leak', 'power_outage', 'traffic_light', 'street_light', 'garbage', 'other'];

// Fix default marker icon (Leaflet CSS issue with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PRIORITY_COLORS = { low: '#4CAF50', medium: '#F5A623', high: '#E74C3C', critical: '#D32F2F' };

function createColorIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></div>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

function HeatmapLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!points.length) return;

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      minOpacity: 0.4,
      max: 1.0,
      gradient: {
        0.1: '#3388ff',
        0.3: '#4CAF50',
        0.5: '#F5A623',
        0.7: '#FF5722',
        1.0: '#E74C3C',
      },
    }).addTo(map);
    layerRef.current = heat;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}

function AutoCenter({ center, zoom }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (center && !hasCentered.current) {
      map.setView([center.lat, center.lng], zoom || 12);
      hasCentered.current = true;
    }
  }, [map, center, zoom]);

  return null;
}

export default function MapView() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('both');
  const navigate = useNavigate();

  // Determine map center based on user's municipality
  const mapCenter = useMemo(() => {
    if (!user?.municipality_name) return null;
    // Try exact match first, then partial match
    const exact = MUNICIPALITY_CENTERS[user.municipality_name];
    if (exact) return exact;
    const key = Object.keys(MUNICIPALITY_CENTERS).find(
      (k) => user.municipality_name.toLowerCase().includes(k.toLowerCase().split(' ')[2] || k.toLowerCase())
    );
    return key ? MUNICIPALITY_CENTERS[key] : null;
  }, [user]);

  useEffect(() => {
    const params = { per_page: 500 };
    if (status) params.status = status;
    if (category) params.category = category;
    api.get('/reports', { params }).then((r) => setReports(r.data.reports));
  }, [status, category]);

  const markers = useMemo(
    () => reports.filter((r) => r.location_lat != null && r.location_lng != null),
    [reports],
  );

  const heatPoints = useMemo(
    () => markers.map((r) => [r.location_lat, r.location_lng, 1.0]),
    [markers],
  );

  const defaultCenter = mapCenter ? [mapCenter.lat, mapCenter.lng] : [-30.5, 25.0];
  const defaultZoom = mapCenter ? mapCenter.zoom : 6;

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 2.5 }}>
            <Typography variant="h6" fontWeight={600}>Map View</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s ? s.replace('_', ' ') : 'All'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c ? CATEGORY_LABELS[c] : 'All'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="heatmap" sx={{ textTransform: 'none', px: 2 }}>
                🔥 Heatmap
              </ToggleButton>
              <ToggleButton value="markers" sx={{ textTransform: 'none', px: 2 }}>
                📍 Pins
              </ToggleButton>
              <ToggleButton value="both" sx={{ textTransform: 'none', px: 2 }}>
                Both
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {markers.length} reports on map
            </Typography>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '70vh', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapCenter && <AutoCenter center={mapCenter} zoom={mapCenter.zoom} />}

          {(viewMode === 'heatmap' || viewMode === 'both') && (
            <HeatmapLayer points={heatPoints} />
          )}

          {(viewMode === 'markers' || viewMode === 'both') && (
            <MarkerClusterGroup chunkedLoading>
              {markers.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.location_lat, r.location_lng]}
                  icon={createColorIcon(STATUS_COLORS[r.status] || '#888')}
                >
                  <Popup maxWidth={300}>
                    <Box sx={{ minWidth: 240 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{r.report_number}</Typography>
                        <StatusBadge status={r.status} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{r.title}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📍 {r.location_address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📂 {CATEGORY_LABELS[r.category] || r.category} &bull; ⚡ {r.priority}
                      </Typography>
                      {r.assignee_name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          👤 {r.assignee_name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        🕐 {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: '#F5A623', '&:hover': { bgcolor: '#e09517' } }}
                        onClick={(e) => { e.stopPropagation(); window.open(`/reports/${r.id}`, '_blank'); }}
                      >
                        Open Report ↗
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </Card>
    </Box>
  );
}
