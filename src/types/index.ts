// ============================================================
// City Watcher - Core Type Definitions
// ============================================================

// --- Geo Types ---
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeoFence {
  type: 'circle' | 'polygon';
  center?: GeoCoordinate;
  radius?: number; // meters
  coordinates?: GeoCoordinate[];
}

// --- Report Types ---
export enum ReportCategory {
  POTHOLE = 'pothole',
  WATER_LEAK = 'water_leak',
  POWER_OUTAGE = 'power_outage',
  TRAFFIC_LIGHT = 'traffic_light',
  STREET_LIGHT = 'street_light',
  GARBAGE = 'garbage',
  OTHER = 'other',
}

export enum ReportStatus {
  RECEIVED = 'received',
  UNDER_REVIEW = 'under_review',
  CREW_DISPATCHED = 'crew_dispatched',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface StatusUpdate {
  reportId: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  timestamp: Date;
  message: string;
  estimatedCompletion?: Date;
}

export interface UserFeedback {
  rating: number;
  comment?: string;
  submittedAt: Date;
}

export interface Report {
  id: string;
  caseId: string; // e.g. "CW-2026-01928"
  userId: string;
  category: ReportCategory;
  description: string;
  photoUrl: string;
  thumbnailUrl: string;
  location: GeoCoordinate;
  address: string;
  status: ReportStatus;
  statusHistory: StatusUpdate[];
  aiClassification: {
    category: ReportCategory;
    confidence: number;
    manuallyOverridden: boolean;
  };
  assignedTo?: string;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  userFeedback?: UserFeedback;
}

// --- Emergency Types ---
export enum EmergencyServiceType {
  POLICE = 'police',
  AMBULANCE = 'ambulance',
  FIRE = 'fire',
}

export enum EmergencyStatus {
  INITIATED = 'initiated',
  CONNECTED = 'connected',
  DISPATCHED = 'dispatched',
  COMPLETED = 'completed',
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  serviceType: EmergencyServiceType;
  location: GeoCoordinate;
  locationAccuracy: number;
  address: string;
  status: EmergencyStatus;
  sessionId: string;
  dispatchId?: string;
  responseTime?: number;
  createdAt: Date;
  connectedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

// --- Alert Types ---
export enum AlertCategory {
  WATER_MAIN_BREAK = 'water_main_break',
  GAS_LEAK = 'gas_leak',
  ROAD_CLOSURE = 'road_closure',
  SEVERE_WEATHER = 'severe_weather',
  PUBLIC_SAFETY = 'public_safety',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface CommunityAlert {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  geofence: GeoFence;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  recipientCount: number;
  actionRequired?: string;
  affectedRadius?: number;
  confirmedCount?: number;
  status?: string;
}

// --- User Types ---
export enum UserRole {
  RESIDENT = 'resident',
  DISPATCHER = 'dispatcher',
  ADMIN = 'admin',
  EMERGENCY_OPERATOR = 'emergency_operator',
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  address?: string;
  emergencyContacts: EmergencyContact[];
}

export interface UserPreferences {
  language: string;
  notificationsEnabled: boolean;
  alertCategories: AlertCategory[];
  locationSharingEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

// --- Notification Types ---
export enum NotificationType {
  STATUS_UPDATE = 'status_update',
  COMMUNITY_ALERT = 'community_alert',
  EMERGENCY_RESPONSE = 'emergency_response',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
}

// --- Navigation Types ---
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  ReportCategory: undefined;
  ReportForm: { category: ReportCategory };
  ReportSubmitted: { caseId: string; category: ReportCategory };
  TrafficLightReport: undefined;
  PowerOutageReport: undefined;
  EmergencySOS: undefined;
  ReportDetail: { reportId: string };
  AlertDetail: { alertId: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Reports: undefined;
  Alerts: undefined;
  Profile: undefined;
};
