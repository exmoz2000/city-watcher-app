# CityWatcher 🚀

A React Native mobile application for community-driven city incident reporting and emergency response management.

## Features

- 📱 Report city incidents (potholes, broken streetlights, etc.)
- 🚨 Emergency SOS functionality
- 🗺️ Interactive heatmap of reported incidents
- 📊 Real-time alerts and notifications
- 👤 User profiles and report tracking
- 🔐 Secure authentication (Login/Signup)
- 📞 **Municipal Contact Database** - 60+ verified contacts across 3 major SA regions
  - KwaZulu-Natal (Durban, KwaDukuza, iLembe District)
  - Western Cape (Cape Town, Stellenbosch, George, and more)
  - Gauteng (Johannesburg, Ekurhuleni, Tshwane/Pretoria)
  - Emergency services, utilities, and reporting channels
  - One-tap calling, email, and WhatsApp integration
  - Search and filter by region, municipality, or service type

## Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation
- React Native Maps

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS on macOS)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CityWatcher
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Control Panel 🎛️

CityWatcher includes a Python-based control panel for easy server management.

### Control Panel Features

- Start/Stop Expo development server
- Enable tunnel mode for remote access
- Launch on Android emulator or web browser
- Real-time server logs monitoring
- Dark theme UI with CityWatcher branding

### Using the Control Panel

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Launch the control panel:
```bash
python control_panel.py
```

The control panel provides:
- **Start Server**: Launch Expo in local mode
- **Stop Server**: Terminate the running server
- **Start Tunnel**: Launch with Expo tunnel for remote access
- **Android**: Open app in Android emulator
- **iOS**: (macOS only - disabled on Windows)
- **Web**: Open app in web browser
- **Clear Logs**: Clear the log display

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

## Project Structure

```
CityWatcher/
├── src/
│   ├── screens/        # App screens
│   ├── navigation/     # Navigation configuration
│   ├── constants/      # Theme, colors, mock data, municipal contacts
│   └── types/          # TypeScript type definitions
├── assets/             # Images and static assets
├── docs/               # Documentation
│   ├── research-brief-kzn-contacts.md      # Research brief
│   ├── South Africa Major Cities Municipality.md  # Contact database
│   ├── contacts-integration-guide.md       # Integration guide
│   └── admin-dashboard-spec.md             # Admin dashboard spec
├── control_panel.py    # Python control panel
└── requirements.txt    # Python dependencies
```

## Municipal Contacts Integration

The app includes a comprehensive database of municipal contacts for South Africa's three major metropolitan regions. See `docs/contacts-integration-guide.md` for implementation details.

### Contact Database Features

- **60+ Verified Contacts** from official .gov.za sources (verified Feb 2026)
- **3 Major Regions**: KZN, Western Cape, Gauteng
- **Multiple Municipalities**: Durban, Cape Town, Johannesburg, Pretoria, and more
- **Service Categories**: Emergency, Municipal, Utilities, Reporting
- **Helper Functions**: Search, filter by region/municipality, get 24/7 services
- **Multi-language Support**: English, Afrikaans, Zulu, Xhosa, Sotho

### Quick Start with Contacts

```typescript
import { 
  MUNICIPAL_CONTACTS, 
  getEmergencyContacts,
  searchContacts 
} from './src/constants/municipalContacts';

// Get all emergency contacts
const emergencies = getEmergencyContacts();

// Search for water services
const waterServices = searchContacts('water');
```

## Admin Dashboard

A Flask-based admin dashboard specification is available in `docs/admin-dashboard-spec.md` for municipalities to track and manage citizen reports. Features include:

- Report management and tracking
- Interactive map view
- Analytics and reporting
- User management
- Light/Dark theme matching the mobile app
- RESTful API for mobile app integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
