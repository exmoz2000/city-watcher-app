# CityWatcher 🚀

A React Native mobile application for community-driven city incident reporting and emergency response management.

## Features

- 📱 Report city incidents (potholes, broken streetlights, etc.)
- 🚨 Emergency SOS functionality
- 🗺️ Interactive heatmap of reported incidents
- 📊 Real-time alerts and notifications
- 👤 User profiles and report tracking
- 🔐 Secure authentication (Login/Signup)

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
│   ├── constants/      # Theme, colors, mock data
│   └── types/          # TypeScript type definitions
├── assets/             # Images and static assets
├── docs/               # Documentation
├── control_panel.py    # Python control panel
└── requirements.txt    # Python dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
