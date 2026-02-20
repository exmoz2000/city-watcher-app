import {
  Report,
  ReportCategory,
  ReportStatus,
  Priority,
  CommunityAlert,
  AlertCategory,
  AlertSeverity,
  User,
  UserRole,
} from '../types';

// ============================================================
// Mock Reports (from mockup screenshots)
// ============================================================

export const mockReports: Report[] = [
  {
    id: '1',
    caseId: 'CW-2026-01928',
    userId: 'user1',
    category: ReportCategory.POTHOLE,
    description: 'Large pothole on Main Road near intersection',
    photoUrl: 'https://placeholder.com/pothole1.jpg',
    thumbnailUrl: 'https://placeholder.com/pothole1_thumb.jpg',
    location: { latitude: -33.9249, longitude: 18.4241, accuracy: 10 },
    address: 'Main Road, Observatory',
    status: ReportStatus.RECEIVED,
    statusHistory: [
      {
        reportId: '1',
        previousStatus: ReportStatus.RECEIVED,
        newStatus: ReportStatus.RECEIVED,
        timestamp: new Date('2026-02-20T10:00:00Z'),
        message: 'Report received',
      },
    ],
    aiClassification: {
      category: ReportCategory.POTHOLE,
      confidence: 0.92,
      manuallyOverridden: false,
    },
    assignedTo: 'Public Works Dept.',
    priority: Priority.MEDIUM,
    createdAt: new Date('2026-02-20T10:00:00Z'),
    updatedAt: new Date('2026-02-20T10:00:00Z'),
  },
  {
    id: '2',
    caseId: 'CW-2026-01902',
    userId: 'user1',
    category: ReportCategory.POWER_OUTAGE,
    description: 'Power outage affecting entire block',
    photoUrl: '',
    thumbnailUrl: '',
    location: { latitude: -33.9280, longitude: 18.4100, accuracy: 15 },
    address: '5th Avenue, Rondebosch',
    status: ReportStatus.CREW_DISPATCHED,
    statusHistory: [
      {
        reportId: '2',
        previousStatus: ReportStatus.RECEIVED,
        newStatus: ReportStatus.RECEIVED,
        timestamp: new Date('2026-02-19T08:00:00Z'),
        message: 'Report received',
      },
      {
        reportId: '2',
        previousStatus: ReportStatus.RECEIVED,
        newStatus: ReportStatus.UNDER_REVIEW,
        timestamp: new Date('2026-02-19T09:30:00Z'),
        message: 'Under review by Dept.',
      },
      {
        reportId: '2',
        previousStatus: ReportStatus.UNDER_REVIEW,
        newStatus: ReportStatus.CREW_DISPATCHED,
        timestamp: new Date('2026-02-20T11:00:00Z'),
        message: 'Team dispatched - En Route',
      },
    ],
    aiClassification: {
      category: ReportCategory.POWER_OUTAGE,
      confidence: 0.88,
      manuallyOverridden: false,
    },
    assignedTo: 'Dept. Team',
    priority: Priority.HIGH,
    createdAt: new Date('2026-02-19T08:00:00Z'),
    updatedAt: new Date('2026-02-20T11:00:00Z'),
  },
  {
    id: '3',
    caseId: 'CW-2026-01930',
    userId: 'user1',
    category: ReportCategory.WATER_LEAK,
    description: 'Water leak on Kloof Street',
    photoUrl: 'https://placeholder.com/leak1.jpg',
    thumbnailUrl: 'https://placeholder.com/leak1_thumb.jpg',
    location: { latitude: -33.9300, longitude: 18.4150, accuracy: 8 },
    address: 'Kloof Street, Gardens',
    status: ReportStatus.IN_PROGRESS,
    statusHistory: [
      {
        reportId: '3',
        previousStatus: ReportStatus.RECEIVED,
        newStatus: ReportStatus.RECEIVED,
        timestamp: new Date('2026-02-20T11:45:00Z'),
        message: 'Report received',
      },
      {
        reportId: '3',
        previousStatus: ReportStatus.RECEIVED,
        newStatus: ReportStatus.IN_PROGRESS,
        timestamp: new Date('2026-02-20T11:55:00Z'),
        message: 'Repairing',
      },
    ],
    aiClassification: {
      category: ReportCategory.WATER_LEAK,
      confidence: 0.95,
      manuallyOverridden: false,
    },
    priority: Priority.HIGH,
    createdAt: new Date('2026-02-20T11:45:00Z'),
    updatedAt: new Date('2026-02-20T11:55:00Z'),
  },
  {
    id: '4',
    caseId: 'CW-2026-01931',
    userId: 'user2',
    category: ReportCategory.POTHOLE,
    description: 'Pothole near school entrance',
    photoUrl: 'https://placeholder.com/pothole2.jpg',
    thumbnailUrl: 'https://placeholder.com/pothole2_thumb.jpg',
    location: { latitude: -33.9350, longitude: 18.4200, accuracy: 12 },
    address: 'School Lane, Newlands',
    status: ReportStatus.CREW_DISPATCHED,
    statusHistory: [],
    aiClassification: {
      category: ReportCategory.POTHOLE,
      confidence: 0.89,
      manuallyOverridden: false,
    },
    priority: Priority.MEDIUM,
    createdAt: new Date('2026-02-20T11:35:00Z'),
    updatedAt: new Date('2026-02-20T11:35:00Z'),
  },
  {
    id: '5',
    caseId: 'CW-2026-01919',
    userId: 'user3',
    category: ReportCategory.GARBAGE,
    description: 'Overflowing trash bins at park',
    photoUrl: 'https://placeholder.com/trash1.jpg',
    thumbnailUrl: 'https://placeholder.com/trash1_thumb.jpg',
    location: { latitude: -33.9200, longitude: 18.4300, accuracy: 10 },
    address: 'Green Park, Observatory',
    status: ReportStatus.RESOLVED,
    statusHistory: [],
    aiClassification: {
      category: ReportCategory.GARBAGE,
      confidence: 0.97,
      manuallyOverridden: false,
    },
    priority: Priority.LOW,
    createdAt: new Date('2026-02-20T11:00:00Z'),
    updatedAt: new Date('2026-02-20T11:00:00Z'),
    resolvedAt: new Date('2026-02-20T12:00:00Z'),
  },
  {
    id: '6',
    caseId: 'CW-2026-01908',
    userId: 'user4',
    category: ReportCategory.OTHER,
    description: 'Building fire reported',
    photoUrl: '',
    thumbnailUrl: '',
    location: { latitude: -33.9180, longitude: 18.4280, accuracy: 5 },
    address: 'Long Street, Central CBD',
    status: ReportStatus.RECEIVED,
    statusHistory: [],
    aiClassification: {
      category: ReportCategory.OTHER,
      confidence: 0.75,
      manuallyOverridden: false,
    },
    priority: Priority.CRITICAL,
    createdAt: new Date('2026-02-20T11:00:00Z'),
    updatedAt: new Date('2026-02-20T11:00:00Z'),
  },
];

// ============================================================
// Mock Alerts
// ============================================================

export const mockAlerts: CommunityAlert[] = [
  {
    id: 'alert1',
    title: 'Power Outage Detected in Your Area',
    message:
      'A power outage has been reported in your area. Eskom teams are investigating.',
    category: AlertCategory.PUBLIC_SAFETY,
    severity: AlertSeverity.WARNING,
    geofence: {
      type: 'circle',
      center: { latitude: -33.9249, longitude: 18.4241, accuracy: 10 },
      radius: 850,
    },
    createdAt: new Date('2026-02-20T12:00:00Z'),
    expiresAt: new Date('2026-02-21T12:00:00Z'),
    isActive: true,
    recipientCount: 147,
    actionRequired: 'Report if you are affected',
    affectedRadius: 850,
    confirmedCount: 147,
    status: 'Investigating',
  },
  {
    id: 'alert2',
    title: 'Water Main Break - 5th Ave',
    message:
      'Water main break reported on 5th Avenue. Avoid the area if possible.',
    category: AlertCategory.WATER_MAIN_BREAK,
    severity: AlertSeverity.CRITICAL,
    geofence: {
      type: 'circle',
      center: { latitude: -33.9280, longitude: 18.4100, accuracy: 10 },
      radius: 500,
    },
    createdAt: new Date('2026-02-20T10:00:00Z'),
    expiresAt: new Date('2026-02-20T22:00:00Z'),
    isActive: true,
    recipientCount: 89,
    actionRequired: 'Avoid area, conserve water',
    affectedRadius: 500,
    confirmedCount: 89,
    status: 'Crew Dispatched',
  },
];

// ============================================================
// Mock User
// ============================================================

export const mockUser: User = {
  id: 'user1',
  email: 'john.doe@email.com',
  phoneNumber: '+27821234567',
  role: UserRole.RESIDENT,
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    address: '12 Main Road, Observatory, Cape Town',
    emergencyContacts: [
      {
        name: 'Jane Doe',
        phoneNumber: '+27829876543',
        relationship: 'Spouse',
      },
    ],
  },
  preferences: {
    language: 'en',
    notificationsEnabled: true,
    alertCategories: Object.values(AlertCategory),
    locationSharingEnabled: true,
  },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-02-20'),
  lastLoginAt: new Date('2026-02-20'),
};

// ============================================================
// Helper to get status display info
// ============================================================

export const statusDisplayMap: Record<
  ReportStatus,
  { label: string; color: string }
> = {
  [ReportStatus.RECEIVED]: { label: 'Report Received', color: '#F5A623' },
  [ReportStatus.UNDER_REVIEW]: { label: 'Under Review', color: '#E91E63' },
  [ReportStatus.CREW_DISPATCHED]: { label: 'Crew Assigned', color: '#5B9BD5' },
  [ReportStatus.IN_PROGRESS]: { label: 'Repair in Progress', color: '#4CAF50' },
  [ReportStatus.RESOLVED]: { label: 'Completed', color: '#4CAF50' },
  [ReportStatus.CLOSED]: { label: 'Closed', color: '#888888' },
};

export const categoryDisplayMap: Record<
  ReportCategory,
  { label: string; icon: string; department: string }
> = {
  [ReportCategory.POTHOLE]: {
    label: 'Pothole',
    icon: 'car',
    department: 'Public Works Dept.',
  },
  [ReportCategory.WATER_LEAK]: {
    label: 'Water Leak',
    icon: 'water',
    department: 'Water & Sanitation',
  },
  [ReportCategory.POWER_OUTAGE]: {
    label: 'Power Outage',
    icon: 'flash',
    department: 'Eskom / Electricity',
  },
  [ReportCategory.TRAFFIC_LIGHT]: {
    label: 'Traffic Light',
    icon: 'traffic-light',
    department: 'Traffic Dept.',
  },
  [ReportCategory.STREET_LIGHT]: {
    label: 'Street Light',
    icon: 'lightbulb-outline',
    department: 'Electricity Dept.',
  },
  [ReportCategory.GARBAGE]: {
    label: 'Trash',
    icon: 'delete',
    department: 'Waste Management',
  },
  [ReportCategory.OTHER]: {
    label: 'Other',
    icon: 'clipboard-text',
    department: 'General Services',
  },
};
