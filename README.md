# CityWatcher 🏙️

A civic engagement platform for South African municipalities — combining a React Native mobile app for residents with a web-based admin dashboard for municipal staff.

## What It Does

**For Residents (Mobile App):**
- Report infrastructure issues (potholes, water leaks, power outages) with photos and GPS
- Emergency SOS with one-touch Police/Ambulance/Fire contact
- Track report status in real-time
- Receive community safety alerts
- Access 60+ verified municipal contacts across KZN, Western Cape, and Gauteng

**For Municipalities (Admin Dashboard):**
- View and manage all citizen reports in a centralized dashboard
- Interactive map view with heatmap overlay and color-coded pins
- SLA tracking with configurable deadlines, breach detection, and compliance dashboard
- Filter, search, sort, bulk actions, and CSV export on reports
- Analytics with date range filtering, department performance, ward breakdown
- Municipality data isolation — each municipality only sees their own data
- Role-based access control (super admin, municipality admin, department manager, field worker)
- User management with role and department assignment
- Light/dark theme with CityWatcher branding

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native, Expo, TypeScript |
| Admin Backend | Flask (Python), SQLAlchemy, JWT Auth |
| Admin Frontend | React 19, Vite, Material-UI, Recharts, Leaflet, nivo |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Testing | pytest (backend), 98 tests |

## Quick Start

### Mobile App
```bash
npm install
npm start
```

### Admin Dashboard

1. Set up the backend:
```bash
cd admin-dashboard/backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python seed.py               # Seed demo data (150 reports, 3 municipalities, SLA configs)
python run.py                # Start on port 5000
```

2. Set up the frontend:
```bash
cd admin-dashboard/frontend
npm install
npm run dev                  # Start on port 5173
```

3. Open `http://localhost:5173` and login:
   - Super Admin: `admin@citywatcher.co.za` / `admin123`
   - Cape Town Admin: `cape.admin@citywatcher.co.za` / `password123`
   - Durban Admin: `durban.admin@citywatcher.co.za` / `password123`
   - JHB Admin: `jhb.admin@citywatcher.co.za` / `password123`

### Control Panel (GUI)
```bash
pip install psutil
python control_panel.py
```
Tabbed UI to start/stop all servers, seed database, install deps, and more.

## Admin Dashboard Pages

| Page | Description |
|------|-------------|
| Dashboard | Metric cards, pie/bar charts, recent activity feed |
| Reports | Table with filters, search, pagination, bulk actions, CSV export |
| Report Detail | Full info, status timeline, comments, assignment |
| Map | Interactive Leaflet map with heatmap + pins, auto-centers on municipality |
| Users | CRUD with role assignment, activate/deactivate |
| Analytics | Date range picker, department performance, ward breakdown, trends |
| SLA | Compliance dashboard (breached/at-risk/on-track), config management |

## Project Structure

```
CityWatcher/
├── src/                          # Mobile app (React Native)
│   ├── screens/                  # App screens
│   ├── navigation/               # Navigation config
│   ├── constants/                # Theme, mock data, municipal contacts
│   └── types/                    # TypeScript types
├── admin-dashboard/
│   ├── backend/                  # Flask API
│   │   ├── app/
│   │   │   ├── models/           # User, Report, Municipality, SLA, Notification
│   │   │   ├── routes/           # Auth, Reports, Users, Dashboard, Analytics, SLA, Notifications
│   │   │   ├── middleware/       # Municipality scope + role-based access control
│   │   │   └── services/         # SLA engine, CSV export
│   │   ├── tests/                # 98 pytest tests (11 test files)
│   │   ├── seed.py               # Demo data seeder
│   │   └── run.py                # Entry point
│   └── frontend/                 # React admin UI
│       └── src/
│           ├── components/       # Layout, Sidebar, Header, MetricCard, StatusBadge
│           ├── pages/            # Dashboard, Reports, ReportDetail, Users, Analytics, MapView, SLA
│           ├── context/          # AuthContext, ThemeContext
│           └── services/         # API client with JWT interceptor
├── docs/                         # Specs, research, business model, recommendations
├── control_panel.py              # Python GUI for server management
├── CHANGELOG.md
└── README.md
```

## Documentation

- `docs/admin-dashboard-spec.md` — Full technical specification
- `docs/requirements.md` — Mobile app requirements
- `docs/design.md` — System architecture and data models
- `docs/contacts-integration-guide.md` — Municipal contacts integration guide
