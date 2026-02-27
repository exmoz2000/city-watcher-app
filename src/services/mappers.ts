import {
  Report,
  ReportCategory,
  ReportStatus,
  Priority,
  StatusUpdate,
  CommunityAlert,
  AlertCategory,
  AlertSeverity,
  User,
  UserRole,
} from '../types';

// ============================================================
// Backend Response Interfaces
// ============================================================

export interface BackendComment {
  id: number;
  user_id: number;
  user_name?: string;
  content: string;
  created_at: string;
}

export interface BackendHistoryEntry {
  id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export interface BackendAttachment {
  id: number;
  report_id: number;
  file_path: string;
  file_type: string;
  uploaded_by: number;
  uploaded_at: string;
}

export interface BackendReport {
  id: number;
  report_number: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location_address: string;
  location_lat: number;
  location_lng: number;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  assigned_to: number | null;
  assignee_name: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  comments?: BackendComment[];
  history?: BackendHistoryEntry[];
  attachments?: BackendAttachment[];
}

export interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  municipality_id: number;
  municipality_name?: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface BackendAlert {
  id: number;
  title: string;
  message: string;
  category: string;
  severity: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  expires_at: string;
  is_active: boolean;
  municipality_id: number;
  created_at: string;
}

// ============================================================
// Mapper Functions
// ============================================================

export function mapBackendReportToMobile(json: BackendReport): Report {
  const statusHistory: StatusUpdate[] = (json.history ?? []).map((h) => ({
    reportId: String(json.id),
    previousStatus: (h.old_value ?? h.new_value ?? 'received') as ReportStatus,
    newStatus: (h.new_value ?? 'received') as ReportStatus,
    timestamp: new Date(h.created_at),
    message: h.action ?? '',
  }));

  return {
    id: String(json.id),
    caseId: json.report_number ?? '',
    userId: json.citizen_email ?? '',
    category: (json.category ?? 'other') as ReportCategory,
    description: json.description ?? '',
    photoUrl: json.attachments?.[0]?.file_path ?? '',
    thumbnailUrl: json.attachments?.[0]?.file_path ?? '',
    location: {
      latitude: json.location_lat ?? 0,
      longitude: json.location_lng ?? 0,
      accuracy: 0,
    },
    address: json.location_address ?? '',
    status: (json.status ?? 'received') as ReportStatus,
    statusHistory,
    aiClassification: {
      category: (json.category ?? 'other') as ReportCategory,
      confidence: 0,
      manuallyOverridden: false,
    },
    assignedTo: json.assignee_name ?? undefined,
    priority: (json.priority ?? 'medium') as Priority,
    createdAt: new Date(json.created_at),
    updatedAt: new Date(json.updated_at),
    resolvedAt: json.completed_at ? new Date(json.completed_at) : undefined,
  };
}

export interface CreateReportBackend {
  category: string;
  title: string;
  description: string;
  priority?: string;
  location_address: string;
  location_lat: number;
  location_lng: number;
  citizen_name?: string;
  citizen_phone?: string;
  citizen_email?: string;
}

export function mapMobileReportToBackend(data: {
  category: string;
  title: string;
  description: string;
  priority?: string;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
}): CreateReportBackend {
  return {
    category: data.category,
    title: data.title,
    description: data.description,
    priority: data.priority,
    location_address: data.locationAddress,
    location_lat: data.locationLat,
    location_lng: data.locationLng,
    citizen_name: data.citizenName,
    citizen_phone: data.citizenPhone,
    citizen_email: data.citizenEmail,
  };
}

export function mapBackendUserToMobile(json: BackendUser): User {
  return {
    id: String(json.id),
    email: json.email ?? '',
    phoneNumber: json.phone ?? '',
    role: (json.role ?? 'resident') as UserRole,
    profile: {
      firstName: json.first_name ?? '',
      lastName: json.last_name ?? '',
      emergencyContacts: [],
    },
    preferences: {
      language: 'en',
      notificationsEnabled: true,
      alertCategories: Object.values(AlertCategory),
      locationSharingEnabled: true,
    },
    createdAt: new Date(json.created_at),
    updatedAt: new Date(json.created_at),
    lastLoginAt: json.last_login ? new Date(json.last_login) : new Date(),
  };
}

export function mapBackendAlertToMobile(json: BackendAlert): CommunityAlert {
  return {
    id: String(json.id),
    title: json.title ?? '',
    message: json.message ?? '',
    category: (json.category ?? 'public_safety') as AlertCategory,
    severity: (json.severity ?? 'info') as AlertSeverity,
    geofence: {
      type: 'circle',
      center: {
        latitude: json.latitude ?? 0,
        longitude: json.longitude ?? 0,
        accuracy: 0,
      },
      radius: json.radius_meters ?? 0,
    },
    createdAt: new Date(json.created_at),
    expiresAt: new Date(json.expires_at),
    isActive: json.is_active ?? true,
    recipientCount: 0,
    affectedRadius: json.radius_meters ?? 0,
  };
}
