// ============================================================
// City Watcher - Heatmap Data
// Cape Town hotspot points for issue density visualization
// ============================================================

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number; // 1-10 intensity
}

export interface HotspotArea {
  name: string;
  center: { latitude: number; longitude: number };
  reportCount: number;
  commonIssue: string;
  avgResolutionDays: number;
  recurrencePercent: number;
}

// Dense point cloud around Cape Town neighborhoods
export const heatmapPoints: HeatmapPoint[] = [
  // Observatory cluster (HIGH density - top hotspot)
  { latitude: -33.9370, longitude: 18.4710, weight: 9 },
  { latitude: -33.9375, longitude: 18.4720, weight: 8 },
  { latitude: -33.9365, longitude: 18.4705, weight: 10 },
  { latitude: -33.9380, longitude: 18.4715, weight: 7 },
  { latitude: -33.9372, longitude: 18.4730, weight: 9 },
  { latitude: -33.9368, longitude: 18.4698, weight: 8 },
  { latitude: -33.9378, longitude: 18.4722, weight: 7 },
  { latitude: -33.9362, longitude: 18.4712, weight: 9 },
  { latitude: -33.9385, longitude: 18.4708, weight: 6 },
  { latitude: -33.9360, longitude: 18.4725, weight: 8 },
  { latitude: -33.9374, longitude: 18.4695, weight: 7 },
  { latitude: -33.9382, longitude: 18.4718, weight: 8 },

  // Central CBD cluster (HIGH density)
  { latitude: -33.9249, longitude: 18.4241, weight: 8 },
  { latitude: -33.9255, longitude: 18.4250, weight: 9 },
  { latitude: -33.9245, longitude: 18.4235, weight: 7 },
  { latitude: -33.9260, longitude: 18.4245, weight: 8 },
  { latitude: -33.9252, longitude: 18.4260, weight: 6 },
  { latitude: -33.9240, longitude: 18.4248, weight: 9 },
  { latitude: -33.9258, longitude: 18.4230, weight: 7 },
  { latitude: -33.9248, longitude: 18.4255, weight: 8 },
  { latitude: -33.9262, longitude: 18.4238, weight: 7 },
  { latitude: -33.9243, longitude: 18.4242, weight: 6 },

  // Rondebosch cluster (MEDIUM density)
  { latitude: -33.9630, longitude: 18.4730, weight: 6 },
  { latitude: -33.9640, longitude: 18.4740, weight: 5 },
  { latitude: -33.9635, longitude: 18.4725, weight: 7 },
  { latitude: -33.9645, longitude: 18.4735, weight: 4 },
  { latitude: -33.9638, longitude: 18.4748, weight: 6 },
  { latitude: -33.9625, longitude: 18.4738, weight: 5 },
  { latitude: -33.9650, longitude: 18.4728, weight: 4 },

  // Woodstock cluster (MEDIUM density)
  { latitude: -33.9280, longitude: 18.4450, weight: 6 },
  { latitude: -33.9275, longitude: 18.4460, weight: 5 },
  { latitude: -33.9285, longitude: 18.4445, weight: 7 },
  { latitude: -33.9290, longitude: 18.4455, weight: 5 },
  { latitude: -33.9278, longitude: 18.4470, weight: 4 },
  { latitude: -33.9282, longitude: 18.4440, weight: 6 },

  // Gardens / Kloof Street cluster (MEDIUM)
  { latitude: -33.9320, longitude: 18.4130, weight: 5 },
  { latitude: -33.9325, longitude: 18.4140, weight: 6 },
  { latitude: -33.9315, longitude: 18.4125, weight: 4 },
  { latitude: -33.9330, longitude: 18.4135, weight: 5 },
  { latitude: -33.9318, longitude: 18.4145, weight: 6 },

  // Hillside / Tamboerskloof (LOW-MEDIUM)
  { latitude: -33.9290, longitude: 18.4080, weight: 4 },
  { latitude: -33.9295, longitude: 18.4090, weight: 3 },
  { latitude: -33.9285, longitude: 18.4075, weight: 5 },
  { latitude: -33.9300, longitude: 18.4085, weight: 3 },

  // Salt River (MEDIUM)
  { latitude: -33.9310, longitude: 18.4580, weight: 5 },
  { latitude: -33.9315, longitude: 18.4590, weight: 6 },
  { latitude: -33.9305, longitude: 18.4575, weight: 4 },
  { latitude: -33.9320, longitude: 18.4585, weight: 5 },
  { latitude: -33.9308, longitude: 18.4595, weight: 7 },

  // Newlands (LOW)
  { latitude: -33.9780, longitude: 18.4600, weight: 3 },
  { latitude: -33.9785, longitude: 18.4610, weight: 2 },
  { latitude: -33.9775, longitude: 18.4595, weight: 3 },
  { latitude: -33.9790, longitude: 18.4605, weight: 2 },

  // Claremont (LOW-MEDIUM)
  { latitude: -33.9850, longitude: 18.4680, weight: 4 },
  { latitude: -33.9855, longitude: 18.4690, weight: 3 },
  { latitude: -33.9845, longitude: 18.4675, weight: 4 },
  { latitude: -33.9860, longitude: 18.4685, weight: 3 },

  // Mowbray (LOW-MEDIUM)
  { latitude: -33.9490, longitude: 18.4740, weight: 4 },
  { latitude: -33.9495, longitude: 18.4750, weight: 5 },
  { latitude: -33.9485, longitude: 18.4735, weight: 3 },
  { latitude: -33.9500, longitude: 18.4745, weight: 4 },

  // Sea Point (LOW)
  { latitude: -33.9170, longitude: 18.3880, weight: 3 },
  { latitude: -33.9175, longitude: 18.3890, weight: 2 },
  { latitude: -33.9165, longitude: 18.3875, weight: 3 },

  // Green Point (LOW)
  { latitude: -33.9090, longitude: 18.4050, weight: 2 },
  { latitude: -33.9095, longitude: 18.4060, weight: 3 },
  { latitude: -33.9085, longitude: 18.4045, weight: 2 },
];

// Hotspot summary areas (matching the mockup dashboard)
export const hotspotAreas: HotspotArea[] = [
  {
    name: 'Observatory',
    center: { latitude: -33.9370, longitude: 18.4710 },
    reportCount: 84,
    commonIssue: 'Water Leaks',
    avgResolutionDays: 3.2,
    recurrencePercent: 68,
  },
  {
    name: 'Central CBD',
    center: { latitude: -33.9249, longitude: 18.4241 },
    reportCount: 67,
    commonIssue: 'Potholes',
    avgResolutionDays: 4.1,
    recurrencePercent: 52,
  },
  {
    name: 'Rondebosch',
    center: { latitude: -33.9635, longitude: 18.4730 },
    reportCount: 41,
    commonIssue: 'Traffic Light Failures',
    avgResolutionDays: 2.8,
    recurrencePercent: 45,
  },
  {
    name: 'Woodstock',
    center: { latitude: -33.9280, longitude: 18.4450 },
    reportCount: 38,
    commonIssue: 'Illegal Dumping',
    avgResolutionDays: 5.6,
    recurrencePercent: 61,
  },
  {
    name: 'Salt River',
    center: { latitude: -33.9310, longitude: 18.4580 },
    reportCount: 29,
    commonIssue: 'Power Outages',
    avgResolutionDays: 1.9,
    recurrencePercent: 55,
  },
];

// Summary stats (from mockup footer bar)
export const heatmapStats = {
  frequentIssues: 235,
  avgResolutionDays: 4.8,
  highRecurrenceZones: 73,
};
