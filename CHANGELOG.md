# Changelog

All notable changes to the CityWatcher project will be documented in this file.

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

**Version**: 1.2.0
**Platform**: React Native (iOS, Android, Web) + Web Admin Dashboard
**Framework**: Expo (mobile), Flask + React (admin)
**Language**: TypeScript (mobile), Python + JavaScript (admin)
