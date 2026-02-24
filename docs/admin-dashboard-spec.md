# CityWatcher Admin Dashboard - Technical Specification

## Project Overview

A self-hosted Flask backend with React frontend admin dashboard for municipalities to track, manage, and respond to citizen reports submitted through the CityWatcher mobile app.

## Technical Stack

### Backend
- **Framework**: Flask (Python)
- **Port**: 5000 (or any available port except 8080)
- **Database**: SQLite (for demo) or PostgreSQL (for production)
- **API**: RESTful API with JSON responses
- **Authentication**: JWT-based authentication
- **CORS**: Enabled for React frontend

### Frontend
- **Framework**: React 18+ with Vite
- **UI Library**: Material-UI (MUI) or Tailwind CSS + Headless UI
- **State Management**: React Context API or Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts or Chart.js
- **Theme**: Light/Dark mode toggle

## Design System

### Color Palette (Based on CityWatcher App)

#### Light Theme
- **Primary**: #F5A623 (Orange)
- **Secondary**: #F7B731 (Amber)
- **Success**: #4CAF50 (Green)
- **Error**: #E74C3C (Red)
- **Info**: #5B9BD5 (Blue)
- **Background**: #FAFAFA
- **Surface**: #FFFFFF
- **Text Primary**: #333333
- **Text Secondary**: #888888

#### Dark Theme
- **Primary**: #F5A623 (Orange)
- **Secondary**: #F7B731 (Amber)
- **Success**: #4CAF50 (Green)
- **Error**: #E74C3C (Red)
- **Info**: #5B9BD5 (Blue)
- **Background**: #1a1a1a
- **Surface**: #2a2a2a
- **Text Primary**: #FFFFFF
- **Text Secondary**: #AAAAAA

## Core Features & Requirements

### 1. Authentication System

#### Login Page
- Email/username and password fields
- "Remember me" checkbox
- "Forgot password" link
- Municipality logo display
- Responsive design

#### User Roles
- **Super Admin**: Full system access, manage municipalities
- **Municipality Admin**: Manage their municipality's reports and staff
- **Department Manager**: Manage specific department reports
- **Field Worker**: View and update assigned reports

### 2. Dashboard (Home Page)

#### Key Metrics Cards
- Total Reports (Today/Week/Month)
- Pending Reports
- In Progress Reports
- Completed Reports
- Average Response Time
- Reports by Category (pie chart)
- Reports by Status (bar chart)
- Geographic heatmap of reports

#### Recent Activity Feed
- Latest report submissions
- Status changes
- Assignments
- Completions

#### Quick Actions
- Create manual report
- Assign reports
- Generate report
- View alerts

### 3. Reports Management

#### Reports List View
**Filters:**
- Status (Received, Under Review, Dispatched, In Progress, Completed)
- Category (Potholes, Street Lights, Water Leaks, etc.)
- Priority (Low, Medium, High, Emergency)
- Date range
- Municipality/Ward
- Assigned to

**Table Columns:**
- Report ID
- Category icon + name
- Location (address)
- Status badge
- Priority indicator
- Submitted date/time
- Assigned to
- Actions (View, Edit, Assign, Delete)

**Features:**
- Search functionality
- Sort by any column
- Bulk actions (assign, update status)
- Export to CSV/PDF
- Pagination

#### Report Detail View
**Information Sections:**
- Report header (ID, status, priority)
- Citizen information (name, phone, email) - anonymized option
- Location details (address, GPS coordinates, map view)
- Category and description
- Photos/attachments gallery
- Timeline of status changes
- Comments/notes section
- Assignment history

**Actions:**
- Update status
- Change priority
- Assign to department/worker
- Add internal notes
- Upload photos (before/after)
- Mark as duplicate
- Close report
- Send notification to citizen

### 4. Map View

#### Interactive Map
- All reports plotted with color-coded markers
- Cluster markers for dense areas
- Filter by status/category/date
- Click marker to view report summary
- Draw area to select multiple reports
- Heatmap overlay option
- Layer toggles (wards, districts, service areas)

### 5. Analytics & Reports

#### Dashboard Analytics
- Reports trend over time (line chart)
- Category breakdown (pie/donut chart)
- Response time metrics
- Completion rate
- Department performance comparison
- Ward-level statistics
- Peak reporting times

#### Report Generation
- Custom date ranges
- Filter by multiple criteria
- Export formats (PDF, Excel, CSV)
- Scheduled reports (daily/weekly/monthly email)
- Report templates

### 6. User Management

#### Users List
- Name, email, role, department
- Status (active/inactive)
- Last login
- Actions (edit, deactivate, reset password)

#### Add/Edit User
- Personal information
- Role assignment
- Department assignment
- Permissions configuration
- Contact details

### 7. Municipality Settings

#### General Settings
- Municipality name and logo
- Contact information
- Operating hours
- Service areas/wards
- Categories configuration
- Priority levels
- Status workflow customization

#### Notification Settings
- Email templates
- SMS templates
- Auto-response rules
- Escalation rules
- SLA configurations

#### Integration Settings
- API keys
- Webhook URLs
- Mobile app configuration
- Third-party integrations

### 8. Notifications System

#### Notification Center
- Bell icon with unread count
- Dropdown list of recent notifications
- Mark as read/unread
- Clear all
- View all notifications page

#### Notification Types
- New report submitted
- Report assigned to you
- Status changed
- High priority alert
- SLA breach warning
- Report completed
- Citizen feedback received

## API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Reports
```
GET    /api/reports
GET    /api/reports/:id
POST   /api/reports
PUT    /api/reports/:id
DELETE /api/reports/:id
PATCH  /api/reports/:id/status
PATCH  /api/reports/:id/assign
POST   /api/reports/:id/comments
POST   /api/reports/:id/attachments
GET    /api/reports/stats
GET    /api/reports/export
```

### Users
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/status
```

### Dashboard
```
GET    /api/dashboard/metrics
GET    /api/dashboard/recent-activity
GET    /api/dashboard/charts
```

### Analytics
```
GET    /api/analytics/trends
GET    /api/analytics/categories
GET    /api/analytics/performance
POST   /api/analytics/generate-report
```

### Municipalities
```
GET    /api/municipalities
GET    /api/municipalities/:id
PUT    /api/municipalities/:id/settings
```

### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
POST   /api/notifications/mark-all-read
```

## Database Schema

### Users Table
```sql
- id (PK)
- email (unique)
- password_hash
- first_name
- last_name
- role (enum)
- department
- municipality_id (FK)
- phone
- is_active
- last_login
- created_at
- updated_at
```

### Reports Table
```sql
- id (PK)
- report_number (unique)
- category
- title
- description
- status (enum)
- priority (enum)
- location_address
- location_lat
- location_lng
- ward
- citizen_name
- citizen_phone
- citizen_email
- assigned_to (FK users)
- municipality_id (FK)
- created_at
- updated_at
- completed_at
```

### Report_Attachments Table
```sql
- id (PK)
- report_id (FK)
- file_path
- file_type
- uploaded_by (FK users)
- uploaded_at
```

### Report_Comments Table
```sql
- id (PK)
- report_id (FK)
- user_id (FK)
- comment_text
- is_internal
- created_at
```

### Report_History Table
```sql
- id (PK)
- report_id (FK)
- user_id (FK)
- action (enum: created, status_changed, assigned, commented, etc.)
- old_value
- new_value
- timestamp
```

### Municipalities Table
```sql
- id (PK)
- name
- logo_url
- contact_email
- contact_phone
- address
- settings (JSON)
- created_at
- updated_at
```

### Notifications Table
```sql
- id (PK)
- user_id (FK)
- type
- title
- message
- link
- is_read
- created_at
```

## Frontend Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   └── ThemeToggle.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── dashboard/
│   │   ├── MetricCard.jsx
│   │   ├── RecentActivity.jsx
│   │   ├── ChartWidget.jsx
│   │   └── QuickActions.jsx
│   ├── reports/
│   │   ├── ReportsList.jsx
│   │   ├── ReportCard.jsx
│   │   ├── ReportDetail.jsx
│   │   ├── ReportFilters.jsx
│   │   ├── StatusBadge.jsx
│   │   └── AssignModal.jsx
│   ├── map/
│   │   ├── MapView.jsx
│   │   ├── ReportMarker.jsx
│   │   └── MapFilters.jsx
│   ├── users/
│   │   ├── UsersList.jsx
│   │   ├── UserForm.jsx
│   │   └── UserCard.jsx
│   └── notifications/
│       ├── NotificationBell.jsx
│       ├── NotificationList.jsx
│       └── NotificationItem.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Reports.jsx
│   ├── ReportDetail.jsx
│   ├── MapView.jsx
│   ├── Analytics.jsx
│   ├── Users.jsx
│   └── Settings.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useTheme.js
│   ├── useNotifications.js
│   └── useReports.js
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── reports.js
│   └── users.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
└── App.jsx
```

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── report.py
│   │   ├── municipality.py
│   │   └── notification.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── reports.py
│   │   ├── users.py
│   │   ├── dashboard.py
│   │   ├── analytics.py
│   │   └── notifications.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── report_service.py
│   │   ├── notification_service.py
│   │   └── email_service.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth_middleware.py
│   │   └── error_handler.py
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
├── migrations/
├── tests/
├── uploads/
├── requirements.txt
├── run.py
└── .env
```

## Installation & Setup Instructions

### Backend Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install flask flask-cors flask-jwt-extended flask-sqlalchemy python-dotenv
```

3. Create `.env` file:
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///citywatcher.db
PORT=5000
```

4. Initialize database:
```bash
flask db init
flask db migrate
flask db upgrade
```

5. Run server:
```bash
python run.py
```

### Frontend Setup

1. Create React app:
```bash
npm create vite@latest admin-dashboard -- --template react
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install react-router-dom axios @mui/material @emotion/react @emotion/styled
npm install recharts react-leaflet leaflet
npm install @mui/icons-material
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
```

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token mechanism
   - Password hashing (bcrypt)
   - Rate limiting on login attempts

2. **Authorization**
   - Role-based access control (RBAC)
   - Permission checks on all endpoints
   - Municipality data isolation

3. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention (ORM)
   - XSS protection
   - CSRF tokens
   - HTTPS in production

4. **File Uploads**
   - File type validation
   - Size limits
   - Virus scanning (optional)
   - Secure storage paths

## Performance Optimization

1. **Backend**
   - Database indexing
   - Query optimization
   - Caching (Redis optional)
   - Pagination for large datasets
   - Background tasks for heavy operations

2. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Debouncing search inputs
   - Virtual scrolling for large lists

## Testing Requirements

1. **Backend Tests**
   - Unit tests for services
   - Integration tests for API endpoints
   - Authentication flow tests

2. **Frontend Tests**
   - Component unit tests
   - Integration tests
   - E2E tests (Cypress optional)

## Deployment Considerations

1. **Backend**
   - Use Gunicorn or uWSGI for production
   - Nginx reverse proxy
   - Environment variables for configuration
   - Database migrations

2. **Frontend**
   - Build for production: `npm run build`
   - Serve static files via Nginx or Flask
   - Environment-specific API URLs

## Mock Data Requirements

Create seed data for testing:
- 3 municipalities (Durban, Cape Town, Johannesburg)
- 10-15 users with different roles
- 50-100 sample reports with various statuses
- Report attachments (sample images)
- Comments and history entries
- Notifications

## Success Criteria

1. ✅ Admin can log in and access dashboard
2. ✅ Dashboard displays real-time metrics and charts
3. ✅ Reports can be filtered, searched, and sorted
4. ✅ Report details show all information and timeline
5. ✅ Status updates reflect immediately
6. ✅ Map view displays all reports with correct locations
7. ✅ Users can be created and managed
8. ✅ Light/dark theme toggle works seamlessly
9. ✅ Responsive design works on tablets and desktops
10. ✅ API endpoints return correct data with proper error handling

## Future Enhancements

- Real-time updates via WebSockets
- Mobile app for field workers
- SMS integration for notifications
- Advanced analytics with ML predictions
- Multi-language support
- Integration with GIS systems
- Automated report routing based on location
- Citizen satisfaction surveys
- Performance dashboards for departments

---

## Implementation Notes for Claude 4.6

This spec is comprehensive and ready for implementation. Start with:
1. Backend Flask setup with basic auth
2. Database models and migrations
3. Core API endpoints (auth, reports, dashboard)
4. React frontend with routing and theme
5. Dashboard page with metrics
6. Reports list and detail pages
7. Map integration
8. User management
9. Polish and testing

Use modern best practices, clean code, and comprehensive error handling throughout.
