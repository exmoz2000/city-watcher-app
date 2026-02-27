# Changelog

All notable changes to the CityWatcher project will be documented in this file.

## [1.3.1] - 2026-02-27

### Fixed - Mobile App Dependencies & Stability
- **Critical Bug Fixes**
  - Fixed missing npm dependencies causing app crashes
  - Added @react-native-async-storage/async-storage for offline storage
  - Added @react-native-community/netinfo for network detection
  - Added axios for HTTP API requests
  - Added expo-secure-store for secure token storage
  - Added expo-notifications for push notifications
  - Fixed syntax error in mappers.ts BackendReport interface (missing closing brace)
  - Fixed AuthContext initialization hanging on Expo Go
  - Removed blocking push notification calls that prevented app startup in Expo Go
  - Fixed Flask backend to listen on all network interfaces (0.0.0.0) for mobile device connectivity

- **Expo Go Compatibility**
  - Disabled automatic update checks to prevent startup delays
  - Made push notifications optional (gracefully skips in Expo Go)
  - Added comprehensive console logging for debugging
  - App now loads successfully in Expo Go development environment

- **Network Configuration**
  - Updated API base URL to use local IP address (192.168.101.108) for physical device testing
  - Backend now accepts connections from local network devices
  - Added clear instructions for switching between localhost (emulator) and IP address (physical device)

- **Configuration Updates**
  - Updated app.json with update settings (checkAutomatically: "ON_ERROR_RECOVERY")
  - Simplified AuthContext to remove notification dependencies during init
  - Added fallback error handling for all async operations
  - Backend run.py now uses host='0.0.0.0' for network accessibility

### Tested & Verified
- ✅ App successfully loads in Expo Go on Android
- ✅ Login/signup functionality working with backend API
- ✅ Network connectivity between mobile device and backend server
- ✅ All critical dependencies installed and functioning

### Notes
- Push notifications will work in standalone builds but are disabled in Expo Go
- Backend API server must be running on host='0.0.0.0' for mobile device access
- Update API base URL in src/services/api.ts when switching between emulator and physical device
- All 6 missing dependencies now properly documented in package.json

---

## [1.3.0] - 2026-02-26

### Added - Mobile API Integration (Backend)

- **Resident Registration**
  - POST /api/auth/register endpoint for mobile user self-registration
  - Validates required fields, password length (8+ chars), duplicate email
  - Creates users with "resident" role, returns JWT token

- **Mobile API Blueprint** (`/api/mobile/`)
  - GET /api/mobile/alerts — community alerts with geographic filtering and severity sorting
  - PATCH /api/mobile/profile — resident profile updates (blocks role/municipality changes)
  - POST /api/mobile/device-tokens — Expo push notification token registration (idempotent)
  - DELETE /api/mobile/device-tokens — token deactivation on logout
  - POST /api/mobile/reports/<id>/attachments — photo upload (JPEG/PNG, max 10MB)

- **New Database Models**
  - DeviceToken — stores Expo push tokens per user with unique constraint
  - CommunityAlert — geofenced alert broadcasts with severity, radius, expiration

- **Resident Role Scoping**
  - scope_query middleware updated: residents see only reports matching their email
  - role_required decorator blocks residents from admin endpoints (dashboard, analytics, users, SLA)

- **Seed Data**
  - 6 community alerts (2 critical, 2 warning, 2 info — including 1 expired and 1 inactive)

- **Test Suite Expansion**
  - 140 total tests (up from 98)
  - 6 new test files: registration, attachments, alerts, profile, device tokens, resident access
  - Tests cover: validation, access control, geographic filtering, file upload constraints, role scoping

---

## [1.2.0] - 2026-02-25

### Added - Dashboard V2 Upgrade

- **Municipality Data Isolation**
  - scope_query middleware filters all API queries by user role and municipality
  - Super admin sees all data; municipality admins see only their municipality
  - Department managers scoped to their department's report categories
  - Field workers see only reports assigned to them
  - role_required decorator for endpoint-level access control

- **SLA Tracking System**
  - SLAConfig model: configurable response times per category per municipality
  - SLATracking model: deadline tracking with breach detection
  - Automatic SLA deadline calculation on report creation
  - Breach detection engine (marks overdue unresolved reports)
  - SLA compliance dashboard (breached, at-risk, on-track classification)
  - SLA config management UI (create, edit, delete) for admins

- **Interactive Map View**
  - Leaflet map with OpenStreetMap tiles centered on South Africa
  - Color-coded markers by report status
  - MarkerClusterGroup for dense areas
  - Popup with report details and "View Details" link
  - Status and category filter bar

- **Enhanced Analytics**
  - Date range picker for all analytics
  - Department performance comparison bar chart (nivo)
  - Ward breakdown bar chart
  - Category trends chart
  - New backend endpoints: department-performance, ward-breakdown

- **Bulk Actions**
  - Checkbox selection on reports table with select-all
  - Bulk status update and bulk assignment
  - Scope enforcement (only in-scope reports modified)
  - Audit trail (ReportHistory) and notifications for assignments

- **CSV Export**
  - Export filtered reports to CSV with one click
  - Municipality-scoped (users only export their own data)
  - Proper CSV escaping for special characters

- **Modern UI Improvements**
  - Animated count-up MetricCards with trend indicators
  - Hover elevation effects on cards
  - Sidebar updated with Map and SLA navigation items

- **Database Indexing**
  - Compound indexes on Report (municipality_id+status, municipality_id+category)
  - Indexes on assigned_to, created_at, SLATracking (deadline+breached), User (municipality_id+role)

- **Test Suite Expansion**
  - 98 total tests (up from 56)
  - New test files: municipality scope, SLA, export, bulk actions, role access
  - Cross-municipality isolation tests verify no data leakage

---

## [1.1.0] - 2026-02-25

### Added - Admin Dashboard (Municipal Management Portal)

- **Flask Backend API** (Python)
  - JWT-based authentication with role-based access control
  - RESTful API with 20+ endpoints for reports, users, dashboard, analytics, notifications
  - SQLAlchemy ORM with SQLite (PostgreSQL-ready via env var)
  - Database models: Users, Reports, ReportComments, ReportHistory, ReportAttachments, Municipalities, Notifications
  - Seed script with demo data: 3 SA municipalities, 11 users, 60 reports across Cape Town, Durban, Johannesburg
  - Bcrypt password hashing, CORS enabled

- **React Frontend** (Vite + Material-UI)
  - Login page with JWT authentication
  - Dashboard with metric cards, pie/bar charts (Recharts), recent activity feed
  - Reports management: list with filtering (status, category, priority), search, pagination
  - Report detail: status timeline, comments, assignment, status updates
  - User management: CRUD, role assignment, activate/deactivate
  - Analytics: 30-day trend line chart, category breakdown, resolution rate
  - Light/dark theme toggle with CityWatcher color palette
  - Responsive sidebar navigation
  - Notification bell with unread count

- **Control Panel** (Python/Tkinter) - Major upgrade
  - Tabbed interface: Overview, Mobile App, Admin Dashboard, Tools
  - Start/stop Flask backend and React frontend independently
  - "Start All" / "Stop All" quick actions
  - Database seed and reset tools
  - Dependency installation buttons (pip, npm)
  - Frontend production build trigger
  - Login credentials display
  - Quick links to open dashboard and API in browser

- **Backend Test Suite** (pytest)
  - 56 tests across 6 test files
  - Auth tests: login, logout, JWT validation, deactivated accounts
  - Report tests: CRUD, filtering, search, pagination, status updates, assignment, comments
  - User tests: CRUD, role filtering, duplicate email, activate/deactivate
  - Dashboard tests: metrics, recent activity, charts
  - Analytics tests: trends, categories, performance
  - Notification tests: list, mark read, mark all read
  - Model tests: password hashing, unique constraints, JSON settings

### Technical Stack - Admin Dashboard
- Backend: Flask 3.1, Flask-JWT-Extended, Flask-SQLAlchemy, bcrypt
- Frontend: React 19, Vite 8, Material-UI 7, Recharts 3, React Router 7, Axios
- Testing: pytest 9 with in-memory SQLite
- Database: SQLite (dev) / PostgreSQL (prod-ready)

---

## [1.0.0] - 2026-02-24

### Added
- **Municipal Contact Database**
  - Comprehensive contact information for 3 major SA regions (KZN, Western Cape, Gauteng)
  - 60+ verified municipal contacts from official .gov.za sources
  - Emergency services, municipal departments, and utility contacts
  - TypeScript data structure with helper functions
  - Search and filter capabilities by region, municipality, and service type
  - National emergency numbers (112, 10111, 10177)

- **Documentation**
  - Research brief for municipal contact collection
  - Complete contact database (South Africa Major Cities Municipality.md)
  - Integration guide with code examples and UI components
  - Admin dashboard technical specification (Flask + React)

- **Python Control Panel** for Expo server management
  - Dark theme UI with CityWatcher orange accent colors
  - Start/Stop server, tunnel mode, Android/Web launch

- **Mobile App Features**
  - Community incident reporting system
  - Emergency SOS functionality
  - Interactive heatmap visualization
  - Real-time alerts and notifications
  - User authentication (Login/Signup)
  - Profile management
  - Report tracking and status updates

### Technical Implementation
- React Native with Expo framework
- TypeScript for type safety
- React Navigation for routing
- React Native Maps integration
- Custom theme system with brand colors

## Project Information

**Version**: 1.3.0
**Platform**: React Native (iOS, Android, Web) + Web Admin Dashboard
**Framework**: Expo (mobile), Flask + React (admin)
**Language**: TypeScript (mobile), Python + JavaScript (admin)
