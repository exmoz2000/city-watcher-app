# Design Document: City Watcher

## Overview

City Watcher is a mobile-first civic engagement platform that bridges the communication gap between residents and municipal services. The system combines infrastructure issue reporting with emergency response capabilities, creating a unified "Digital Nervous System" for modern cities.

The architecture follows a client-server model with real-time communication capabilities, AI-powered image classification, and geospatial services. The mobile application (iOS and Android) serves as the primary interface, supported by a web-based municipal dashboard for dispatchers and administrators.

### Key Design Principles

1. **Mobile-First**: Optimized for smartphone usage with offline capabilities
2. **Real-Time Communication**: WebSocket-based push notifications for instant updates
3. **Location-Centric**: GPS and geofencing at the core of all features
4. **AI-Assisted**: Automated categorization to reduce manual triage
5. **Privacy-Preserving**: Location data used only for explicit purposes with user consent
6. **Accessibility**: WCAG 2.1 AA compliant with multi-language support

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Applications                      │
│                    (iOS / Android)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Report UI    │  │ Emergency    │  │ Alerts UI    │     │
│  │              │  │ SOS UI       │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              (Authentication / Rate Limiting)                │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Report       │    │ Emergency    │    │ Alert        │
│ Service      │    │ Service      │    │ Service      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ AI Image     │    │ Emergency    │    │ Geofencing   │
│ Classifier   │    │ Dispatch API │    │ Engine       │
└──────────────┘    └──────────────┘    └──────────────┘
        │                                       │
        ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ Redis Cache  │  │ S3 Storage   │     │
│  │ (Reports)    │  │ (Sessions)   │  │ (Images)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```



### Technology Stack

**Mobile Applications:**
- React Native (cross-platform iOS/Android)
- React Native Maps for mapping and geolocation
- React Native Push Notifications for alerts
- AsyncStorage for offline data persistence
- React Native Camera for photo capture

**Backend Services:**
- Node.js with Express.js for API services
- WebSocket (Socket.io) for real-time communication
- PostgreSQL for relational data (reports, users, alerts)
- Redis for session management and caching
- AWS S3 for image storage
- AWS Lambda for serverless AI processing

**AI/ML Services:**
- TensorFlow Lite or PyTorch Mobile for on-device preprocessing
- Cloud-based image classification API (AWS Rekognition Custom Labels or custom CNN model)
- Pre-trained models for infrastructure damage detection

**Geospatial Services:**
- PostGIS extension for PostgreSQL (geospatial queries)
- Turf.js for geofencing calculations
- Google Maps Platform or Mapbox for mapping services

**Municipal Dashboard:**
- React.js web application
- Material-UI component library
- Chart.js for analytics visualization

## Components and Interfaces

### 1. Mobile Application Components

#### 1.1 Report Module

**Purpose**: Capture and submit infrastructure issue reports with photos and GPS coordinates.

**Key Components:**
- `CameraCapture`: Handles photo capture with metadata
- `ReportForm`: Collects issue description and category
- `LocationService`: Manages GPS coordinate acquisition
- `OfflineQueue`: Stores reports when offline for later submission

**Interfaces:**
```typescript
interface InfrastructureReport {
  id: string;
  userId: string;
  category: ReportCategory;
  description: string;
  photoUrl: string;
  location: GeoCoordinate;
  timestamp: Date;
  status: ReportStatus;
  aiConfidence: number;
}

interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number;
}

enum ReportCategory {
  POTHOLE = 'pothole',
  WATER_LEAK = 'water_leak',
  POWER_OUTAGE = 'power_outage',
  TRAFFIC_LIGHT = 'traffic_light',
  STREET_LIGHT = 'street_light',
  GARBAGE = 'garbage',
  OTHER = 'other'
}

enum ReportStatus {
  RECEIVED = 'received',
  UNDER_REVIEW = 'under_review',
  CREW_DISPATCHED = 'crew_dispatched',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}
```



#### 1.2 Emergency SOS Module

**Purpose**: Provide one-touch emergency service contact with automatic location transmission.

**Key Components:**
- `EmergencyButton`: Large, accessible buttons for Police, Ambulance, Fire
- `LocationTransmitter`: Sends GPS coordinates to emergency dispatch
- `EmergencySession`: Maintains active connection during emergency
- `FallbackHandler`: Manages scenarios when GPS is unavailable

**Interfaces:**
```typescript
interface EmergencyRequest {
  id: string;
  userId: string;
  serviceType: EmergencyServiceType;
  location: GeoCoordinate;
  timestamp: Date;
  status: EmergencyStatus;
  sessionId: string;
}

enum EmergencyServiceType {
  POLICE = 'police',
  AMBULANCE = 'ambulance',
  FIRE = 'fire'
}

enum EmergencyStatus {
  INITIATED = 'initiated',
  CONNECTED = 'connected',
  DISPATCHED = 'dispatched',
  COMPLETED = 'completed'
}
```

#### 1.3 Live Loop (Status Tracking) Module

**Purpose**: Display real-time updates on submitted reports.

**Key Components:**
- `ReportList`: Displays user's active and historical reports
- `StatusTimeline`: Shows progression through status stages
- `NotificationHandler`: Receives and displays push notifications
- `WebSocketClient`: Maintains real-time connection to backend

**Interfaces:**
```typescript
interface StatusUpdate {
  reportId: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  timestamp: Date;
  message: string;
  estimatedCompletion?: Date;
}

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
}

enum NotificationType {
  STATUS_UPDATE = 'status_update',
  COMMUNITY_ALERT = 'community_alert',
  EMERGENCY_RESPONSE = 'emergency_response'
}
```



#### 1.4 Community Alert Module

**Purpose**: Receive and display location-based safety alerts from the city.

**Key Components:**
- `AlertReceiver`: Processes incoming geofenced alerts
- `AlertDisplay`: Shows alerts with map visualization
- `GeofenceMonitor`: Checks if user is within alert boundaries
- `AlertHistory`: Maintains log of received alerts

**Interfaces:**
```typescript
interface CommunityAlert {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  geofence: GeoFence;
  timestamp: Date;
  expiresAt: Date;
  actionRequired?: string;
}

interface GeoFence {
  type: 'circle' | 'polygon';
  center?: GeoCoordinate;
  radius?: number; // meters
  coordinates?: GeoCoordinate[];
}

enum AlertCategory {
  WATER_MAIN_BREAK = 'water_main_break',
  GAS_LEAK = 'gas_leak',
  ROAD_CLOSURE = 'road_closure',
  SEVERE_WEATHER = 'severe_weather',
  PUBLIC_SAFETY = 'public_safety'
}

enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}
```

### 2. Backend Service Components

#### 2.1 Report Service

**Purpose**: Handle infrastructure report submission, storage, and status management.

**Key Operations:**
- `createReport()`: Validate and store new reports
- `updateReportStatus()`: Update status and trigger notifications
- `getReportsByUser()`: Retrieve user's report history
- `getReportsByArea()`: Query reports within geographic bounds

**API Endpoints:**
```
POST   /api/v1/reports              - Create new report
GET    /api/v1/reports/:id          - Get report details
PATCH  /api/v1/reports/:id/status   - Update report status
GET    /api/v1/reports/user/:userId - Get user's reports
GET    /api/v1/reports/area         - Get reports in area (with bounds)
```



#### 2.2 AI Image Classification Service

**Purpose**: Automatically categorize infrastructure issues from photos.

**Key Operations:**
- `classifyImage()`: Analyze image and return category with confidence score
- `preprocessImage()`: Resize and normalize image for model input
- `validateClassification()`: Apply confidence thresholds

**Classification Model:**
- Pre-trained CNN model fine-tuned on infrastructure damage dataset
- Categories: pothole, crack, water leak, power line damage, traffic signal, street light, garbage
- Confidence threshold: 0.75 (below threshold requires manual review)
- Fallback: If classification fails or confidence is low, default to "OTHER" category

**Integration:**
```typescript
interface ClassificationResult {
  category: ReportCategory;
  confidence: number;
  alternativeCategories: Array<{
    category: ReportCategory;
    confidence: number;
  }>;
  processingTime: number;
}

interface ClassificationRequest {
  imageUrl: string;
  imageMetadata: {
    width: number;
    height: number;
    format: string;
  };
}
```

#### 2.3 Emergency Service

**Purpose**: Handle emergency requests and coordinate with dispatch systems.

**Key Operations:**
- `initiateEmergency()`: Create emergency request and notify dispatch
- `transmitLocation()`: Send GPS coordinates to emergency services
- `maintainSession()`: Keep connection alive during emergency
- `logEmergencyEvent()`: Record all emergency interactions for audit

**Integration with Dispatch:**
- RESTful API integration with municipal emergency dispatch systems
- Fallback to direct phone call if API unavailable
- Automatic retry logic with exponential backoff
- Location transmitted in standard format (latitude, longitude, accuracy)



#### 2.4 Alert Service

**Purpose**: Manage community alerts and geofenced notifications.

**Key Operations:**
- `createAlert()`: Create new community alert with geofence
- `publishAlert()`: Send push notifications to affected users
- `checkGeofence()`: Determine if user location is within alert boundary
- `getActiveAlerts()`: Retrieve current alerts for user's location

**Geofencing Logic:**
- Client-side geofence checking for immediate response
- Server-side validation for security and accuracy
- Uses Turf.js for point-in-polygon calculations
- Supports circular and polygonal geofences

**API Endpoints:**
```
POST   /api/v1/alerts              - Create new alert (admin only)
GET    /api/v1/alerts/active       - Get active alerts for location
GET    /api/v1/alerts/history      - Get alert history
DELETE /api/v1/alerts/:id          - Expire/delete alert (admin only)
```

#### 2.5 Real-Time Notification Service

**Purpose**: Deliver instant updates via WebSocket and push notifications.

**Key Operations:**
- `establishConnection()`: Create WebSocket connection for user
- `broadcastUpdate()`: Send update to specific user or group
- `sendPushNotification()`: Deliver notification when app is backgrounded
- `manageSubscriptions()`: Handle user notification preferences

**WebSocket Events:**
```typescript
// Client → Server
'subscribe': { userId: string, topics: string[] }
'unsubscribe': { userId: string, topics: string[] }
'ping': { timestamp: number }

// Server → Client
'status_update': StatusUpdate
'community_alert': CommunityAlert
'emergency_response': EmergencyResponse
'pong': { timestamp: number }
```

**Push Notification Integration:**
- Firebase Cloud Messaging (FCM) for Android
- Apple Push Notification Service (APNs) for iOS
- Fallback to WebSocket when app is in foreground
- Notification priority levels (low, default, high)



### 3. Municipal Dashboard Components

#### 3.1 Report Management Interface

**Purpose**: Allow dispatchers to view, triage, and manage incoming reports.

**Key Features:**
- Interactive map view with report markers
- List view with filtering and sorting
- Bulk status updates
- Assignment to departments/crews
- Analytics dashboard

**Filters:**
- Category (pothole, water leak, etc.)
- Status (received, in progress, etc.)
- Date range
- Geographic area
- Priority level

#### 3.2 Alert Management Interface

**Purpose**: Create and manage community alerts with geofencing.

**Key Features:**
- Map-based geofence drawing tool
- Alert template library
- Scheduling and expiration
- Delivery confirmation tracking
- Alert history and analytics

### 4. Authentication and Authorization

**Authentication Methods:**
- Email/password with bcrypt hashing
- Phone number with SMS verification
- OAuth 2.0 (Google, Apple Sign-In)
- JWT tokens for session management

**Authorization Roles:**
- `RESIDENT`: Standard user, can submit reports and receive alerts
- `DISPATCHER`: Municipal staff, can view and manage reports
- `ADMIN`: Full access, can create alerts and manage users
- `EMERGENCY_OPERATOR`: Can view emergency requests and dispatch

**Token Structure:**
```typescript
interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}
```



## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  address?: string;
  emergencyContacts: EmergencyContact[];
}

interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface UserPreferences {
  language: string;
  notificationsEnabled: boolean;
  alertCategories: AlertCategory[];
  locationSharingEnabled: boolean;
}
```

### Report Model

```typescript
interface Report {
  id: string;
  userId: string;
  category: ReportCategory;
  description: string;
  photoUrl: string;
  thumbnailUrl: string;
  location: GeoCoordinate;
  address: string; // Reverse geocoded
  status: ReportStatus;
  statusHistory: StatusUpdate[];
  aiClassification: {
    category: ReportCategory;
    confidence: number;
    manuallyOverridden: boolean;
  };
  assignedTo?: string; // Department or crew ID
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  userFeedback?: UserFeedback;
}

enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface UserFeedback {
  rating: number; // 1-5
  comment?: string;
  submittedAt: Date;
}
```



### Emergency Request Model

```typescript
interface EmergencyRequest {
  id: string;
  userId: string;
  serviceType: EmergencyServiceType;
  location: GeoCoordinate;
  locationAccuracy: number;
  address: string;
  status: EmergencyStatus;
  sessionId: string;
  dispatchId?: string;
  responseTime?: number; // seconds
  createdAt: Date;
  connectedAt?: Date;
  completedAt?: Date;
  notes?: string;
}
```

### Community Alert Model

```typescript
interface Alert {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  geofence: GeoFence;
  createdBy: string; // Admin user ID
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  recipientCount: number;
  deliveryStatus: {
    sent: number;
    delivered: number;
    failed: number;
  };
  actionRequired?: string;
  relatedReportIds?: string[];
}
```

### Database Schema (PostgreSQL with PostGIS)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  profile JSONB NOT NULL,
  preferences JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Reports table with PostGIS geometry
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  address VARCHAR(500),
  status VARCHAR(50) NOT NULL,
  status_history JSONB NOT NULL,
  ai_classification JSONB NOT NULL,
  assigned_to VARCHAR(255),
  priority VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  user_feedback JSONB
);

-- Spatial index for location queries
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);

-- Emergency requests table
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  service_type VARCHAR(50) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  location_accuracy FLOAT NOT NULL,
  address VARCHAR(500),
  status VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  dispatch_id VARCHAR(255),
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  connected_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT
);

-- Alerts table with PostGIS geometry
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  geofence GEOMETRY(Polygon, 4326) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  recipient_count INTEGER DEFAULT 0,
  delivery_status JSONB NOT NULL,
  action_required TEXT,
  related_report_ids UUID[]
);

CREATE INDEX idx_alerts_geofence ON alerts USING GIST(geofence);
CREATE INDEX idx_alerts_active ON alerts(is_active, expires_at);
```



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

The following properties define the correctness criteria for City Watcher. Each property is universally quantified and will be validated through property-based testing during implementation.

### Infrastructure Reporting Properties

**Property 1: GPS Coordinate Tagging**
*For any* photo captured through the infrastructure reporting interface, the resulting report SHALL include valid GPS coordinates (latitude, longitude, accuracy) attached to the photo metadata.
**Validates: Requirements 1.1**

**Property 2: AI Classification Validity**
*For any* submitted photo, the AI categorizer SHALL return a classification result with a valid ReportCategory and a confidence score between 0.0 and 1.0.
**Validates: Requirements 1.2**

**Property 3: Unique Report Identifiers**
*For any* two reports created in the system, their tracking identifiers SHALL be distinct (no collisions).
**Validates: Requirements 1.3**

### Emergency SOS Properties

**Property 4: Emergency GPS Transmission**
*For any* emergency service button press (Police, Ambulance, Fire), the system SHALL transmit the user's current GPS coordinates to the appropriate dispatcher within 2 seconds.
**Validates: Requirements 2.2**

**Property 5: Emergency Connection Establishment**
*For any* initiated emergency request, the system SHALL establish and maintain a communication channel until explicitly terminated by either the resident or dispatcher.
**Validates: Requirements 2.3, 2.4**



### Real-Time Status Tracking Properties

**Property 6: Status Update Round-Trip**
*For any* report status update made by a municipal dispatcher, the new status SHALL be reflected in the resident's app within 5 seconds, and the resident SHALL receive a push notification.
**Validates: Requirements 3.1, 7.3**

**Property 7: Report History Completeness**
*For any* resident viewing their report history, each report SHALL display its current status and a complete timestamp history of all status changes.
**Validates: Requirements 3.3**

**Property 8: Resolution Feedback Request**
*For any* report that transitions to "Resolved" status, the system SHALL send a feedback request to the submitting resident.
**Validates: Requirements 3.5**

### Community Alert Properties

**Property 9: Alert Geofence Specification**
*For any* community alert created by a dispatcher, the alert SHALL include a valid geographic boundary (either circular with center/radius or polygonal with coordinates).
**Validates: Requirements 4.1**

**Property 10: Geofenced Alert Delivery**
*For any* published community alert with a geofence, the system SHALL deliver push notifications only to residents whose current location falls within the specified geographic boundary, and each delivered alert SHALL include the affected location and recommended actions.
**Validates: Requirements 4.2, 4.4**

**Property 11: Alert History Persistence**
*For any* community alert that has been published, the alert SHALL remain accessible in the alert history for all residents who received it, even after it expires.
**Validates: Requirements 4.5**



### Authentication and User Management Properties

**Property 12: Registration Validation**
*For any* user registration attempt, the system SHALL reject the registration if either the email address or phone number is invalid or missing, and SHALL accept it only when both are valid.
**Validates: Requirements 5.1**

**Property 13: Profile Update Persistence**
*For any* user profile update (emergency contacts, notification preferences), the changes SHALL be persisted to the database and reflected immediately in subsequent profile retrievals.
**Validates: Requirements 5.4**

**Property 14: Password Reset Functionality**
*For any* user who initiates a password reset, the system SHALL generate a unique reset token, send it to the user's verified email, and allow password change only with a valid, unexpired token.
**Validates: Requirements 5.5**

**Property 15: Password Hashing**
*For any* user password stored in the database, the password SHALL be hashed (not stored in plaintext), and the hash SHALL be verifiable against the original password.
**Validates: Requirements 6.2**

**Property 16: Account Deletion and PII Removal**
*For any* user who deletes their account, all personally identifiable information (email, phone, name, address) SHALL be removed from the database, while maintaining anonymized report data for municipal records.
**Validates: Requirements 6.5**

### Municipal Dashboard Properties

**Property 17: Real-Time Report Display**
*For any* report or emergency request submitted by a resident, the submission SHALL appear in the municipal dispatcher dashboard within 3 seconds.
**Validates: Requirements 7.1**

**Property 18: Report Filtering Accuracy**
*For any* filter applied by a dispatcher (category, status, priority, geographic area), the displayed reports SHALL match all specified filter criteria, and no reports outside the criteria SHALL be displayed.
**Validates: Requirements 7.2**

**Property 19: Role-Based Access Control**
*For any* user attempting to access a resource, the system SHALL grant access only if the user's role has the required permissions, and SHALL deny access otherwise.
**Validates: Requirements 7.5**



### Offline Capability Properties

**Property 20: Offline Report Queue Processing**
*For any* reports drafted while offline, when connectivity is restored, the system SHALL automatically submit all pending reports in the order they were created.
**Validates: Requirements 8.2**

**Property 21: Offline Mode Indication**
*For any* time when the device lacks internet connectivity, the app SHALL display a clear offline mode indicator to the user.
**Validates: Requirements 8.3**

**Property 22: Offline Data Caching**
*For any* report or alert that has been viewed while online, the data SHALL remain accessible for viewing when the device is offline.
**Validates: Requirements 8.5**

### Multi-Language Support Properties

**Property 23: Language Selection and UI Update**
*For any* language selected by a user from the supported languages, all interface elements SHALL be displayed in that language, and the preference SHALL persist across app sessions.
**Validates: Requirements 10.2, 10.5**

**Property 24: Multi-Language Report Submission**
*For any* report description submitted in any supported language, the system SHALL accept and store the description without modification or rejection.
**Validates: Requirements 10.3**

**Property 25: Translation Assistance for Dispatchers**
*For any* report received in a non-English language, the municipal dashboard SHALL offer translation assistance to the dispatcher viewing the report.
**Validates: Requirements 10.4**



## Error Handling

### Error Categories

**1. Network Errors**
- Connection timeout (30 seconds for API calls, 5 seconds for emergency)
- No internet connectivity
- Server unavailable (5xx errors)
- Rate limiting (429 errors)

**Handling Strategy:**
- Retry with exponential backoff (max 3 attempts)
- Queue operations for offline processing
- Display user-friendly error messages
- Log errors for debugging

**2. Location Errors**
- GPS unavailable
- Location permission denied
- Low accuracy (>100 meters)
- Location services disabled

**Handling Strategy:**
- Prompt user to enable location services
- For reports: Allow manual address entry as fallback
- For emergencies: Display prominent warning and attempt alternative location methods (cell tower triangulation, WiFi positioning)
- Never allow emergency requests without any location data

**3. Authentication Errors**
- Invalid credentials
- Expired session token
- Account locked/suspended
- Insufficient permissions

**Handling Strategy:**
- Clear, specific error messages
- Automatic token refresh for expired sessions
- Redirect to login for authentication failures
- Contact support message for account issues

**4. Validation Errors**
- Invalid email format
- Missing required fields
- File size too large (>10MB for photos)
- Invalid geofence coordinates

**Handling Strategy:**
- Client-side validation before submission
- Server-side validation as final check
- Specific field-level error messages
- Prevent submission until errors are resolved

**5. AI Classification Errors**
- Model inference failure
- Low confidence score (<0.75)
- Image processing error
- Unsupported image format

**Handling Strategy:**
- Fallback to "OTHER" category
- Flag for manual review by dispatcher
- Allow user to manually select category
- Log errors for model improvement



### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    requestId: string;
  };
}
```

**Example Error Responses:**

```json
// Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "phoneNumber": "Phone number is required"
    },
    "timestamp": "2026-02-19T10:30:00Z",
    "requestId": "req_abc123"
  }
}

// Location Error
{
  "error": {
    "code": "LOCATION_UNAVAILABLE",
    "message": "Unable to determine device location",
    "details": {
      "reason": "GPS_DISABLED",
      "suggestion": "Please enable location services in device settings"
    },
    "timestamp": "2026-02-19T10:30:00Z",
    "requestId": "req_def456"
  }
}

// Emergency Error (Critical)
{
  "error": {
    "code": "EMERGENCY_DISPATCH_FAILED",
    "message": "Unable to connect to emergency services",
    "details": {
      "serviceType": "AMBULANCE",
      "fallbackNumber": "911",
      "suggestion": "Please call 911 directly"
    },
    "timestamp": "2026-02-19T10:30:00Z",
    "requestId": "req_ghi789"
  }
}
```

### Critical Error Handling

**Emergency Service Failures:**
- Display prominent alert with fallback phone number (911)
- Attempt to establish voice call automatically
- Log incident for system monitoring
- Never silently fail emergency requests

**Data Loss Prevention:**
- Auto-save drafts every 30 seconds
- Persist offline queue to device storage
- Confirm successful submission before clearing local data
- Provide manual retry option for failed submissions



## Testing Strategy

### Dual Testing Approach

City Watcher will employ both unit testing and property-based testing to ensure comprehensive coverage and correctness:

**Unit Tests:**
- Verify specific examples and edge cases
- Test integration points between components
- Validate error conditions and boundary cases
- Test UI component rendering and interactions
- Mock external dependencies (APIs, GPS, camera)

**Property-Based Tests:**
- Verify universal properties across all inputs
- Test with randomized data generation (100+ iterations per property)
- Validate correctness properties defined in the design document
- Ensure system behavior holds for all valid input combinations
- Catch edge cases that manual test cases might miss

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property-based tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Framework Selection:**
- **JavaScript/TypeScript**: fast-check library
- **Backend Services**: fast-check for Node.js services
- **Mobile (if native)**: SwiftCheck (iOS), junit-quickcheck (Android)

**Test Configuration:**
- Minimum 100 iterations per property test
- Configurable seed for reproducible failures
- Shrinking enabled to find minimal failing examples
- Timeout: 30 seconds per property test

**Test Tagging:**
Each property-based test MUST include a comment tag referencing the design document property:

```typescript
// Feature: city-watcher, Property 1: GPS Coordinate Tagging
test('all captured photos include GPS coordinates', () => {
  fc.assert(
    fc.property(
      fc.record({
        imageData: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
        timestamp: fc.date()
      }),
      (photoInput) => {
        const report = capturePhoto(photoInput);
        return (
          report.location !== undefined &&
          isValidLatitude(report.location.latitude) &&
          isValidLongitude(report.location.longitude) &&
          report.location.accuracy > 0
        );
      }
    ),
    { numRuns: 100 }
  );
});
```



### Unit Testing Strategy

**Mobile Application Tests:**
- Component rendering tests (React Native Testing Library)
- Navigation flow tests
- Form validation tests
- Offline queue functionality tests
- Camera and location service integration tests (mocked)

**Backend Service Tests:**
- API endpoint tests (request/response validation)
- Database query tests
- Authentication and authorization tests
- WebSocket connection tests
- AI classification service tests (with sample images)

**Integration Tests:**
- End-to-end report submission flow
- Emergency request flow
- Alert delivery flow
- Real-time status update flow
- Offline-to-online synchronization

**Test Coverage Goals:**
- Unit test coverage: >80% for business logic
- Integration test coverage: All critical user flows
- Property test coverage: All 25 correctness properties

### Test Data Generation

**Generators for Property-Based Tests:**

```typescript
// Location generator
const locationGen = fc.record({
  latitude: fc.double({ min: -90, max: 90 }),
  longitude: fc.double({ min: -180, max: 180 }),
  accuracy: fc.double({ min: 1, max: 100 })
});

// Report generator
const reportGen = fc.record({
  userId: fc.uuid(),
  category: fc.constantFrom(...Object.values(ReportCategory)),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  location: locationGen,
  timestamp: fc.date()
});

// Emergency request generator
const emergencyGen = fc.record({
  userId: fc.uuid(),
  serviceType: fc.constantFrom(...Object.values(EmergencyServiceType)),
  location: locationGen,
  timestamp: fc.date()
});

// Geofence generator (circular)
const circularGeofenceGen = fc.record({
  center: locationGen,
  radius: fc.integer({ min: 100, max: 10000 }) // meters
});

// Alert generator
const alertGen = fc.record({
  title: fc.string({ minLength: 5, maxLength: 100 }),
  message: fc.string({ minLength: 10, maxLength: 500 }),
  category: fc.constantFrom(...Object.values(AlertCategory)),
  severity: fc.constantFrom(...Object.values(AlertSeverity)),
  geofence: circularGeofenceGen
});
```

### Continuous Integration

**CI/CD Pipeline:**
1. Lint and format check
2. Unit tests (parallel execution)
3. Property-based tests (sequential, with caching)
4. Integration tests
5. Build mobile apps (iOS/Android)
6. Deploy to staging environment
7. Smoke tests on staging
8. Manual approval for production

**Test Execution Time:**
- Unit tests: ~5 minutes
- Property tests: ~15 minutes (100 iterations × 25 properties)
- Integration tests: ~10 minutes
- Total: ~30 minutes

### Monitoring and Observability

**Production Monitoring:**
- Error rate tracking (by error code)
- API response time metrics
- WebSocket connection stability
- Emergency request success rate (critical metric)
- Report submission success rate
- Alert delivery success rate
- AI classification accuracy tracking

**Alerting Thresholds:**
- Emergency request failure rate >1%: Critical alert
- API error rate >5%: Warning alert
- WebSocket disconnection rate >10%: Warning alert
- Report submission failure rate >3%: Warning alert

**Logging:**
- Structured JSON logs
- Request ID tracking across services
- User ID tracking (with privacy considerations)
- Performance metrics (response times, database query times)
- Error stack traces and context

