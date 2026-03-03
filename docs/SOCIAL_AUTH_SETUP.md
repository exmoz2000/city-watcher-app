# Social Authentication Setup Guide

This guide explains how to configure OAuth credentials for Google, Facebook, and Apple Sign-In.

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- Apple Developer account (for iOS)

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"

### 2. Configure OAuth Consent Screen

- Application name: CityWatcher
- User support email: your-email@example.com
- Scopes: email, profile

### 3. Create Client IDs

Create three OAuth 2.0 Client IDs:

**Web Client ID** (for backend verification):
- Application type: Web application
- Authorized redirect URIs: Not required for mobile

**iOS Client ID**:
- Application type: iOS
- Bundle ID: `com.citywatcher.app`

**Android Client ID**:
- Application type: Android
- Package name: `com.citywatcher.app`
- SHA-1 certificate fingerprint: Get from `keytool -list -v -keystore ~/.android/debug.keystore`

### 4. Update Configuration

Update `app.json`:
```json
"extra": {
  "googleWebClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  "googleIosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  "googleAndroidClientId": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com"
}
```

Update backend `.env`:
```
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

## Facebook Login Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Select "Consumer" as app type
4. Add "Facebook Login" product

### 2. Configure Facebook Login

- Valid OAuth Redirect URIs: Not required for mobile
- Add platform: iOS
  - Bundle ID: `com.citywatcher.app`
- Add platform: Android
  - Package name: `com.citywatcher.app`
  - Key hash: Get from `keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64`

### 3. Update Configuration

Update `app.json`:
```json
"extra": {
  "facebookAppId": "YOUR_FACEBOOK_APP_ID",
  "facebookDisplayName": "CityWatcher"
}
```

Update backend `.env`:
```
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET
```

## Apple Sign-In Setup

### 1. Configure App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles → Identifiers
3. Select your App ID or create new one
4. Enable "Sign In with Apple" capability

### 2. Create Service ID

1. Create a new Services ID
2. Enable "Sign In with Apple"
3. Configure domains and redirect URLs (for web, not required for native)

### 3. Update Configuration

Update `app.json`:
```json
"ios": {
  "usesAppleSignIn": true
}
```

Update backend `.env`:
```
APPLE_CLIENT_ID=com.citywatcher.app
```

## Backend Environment Variables

Create or update `admin-dashboard/backend/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

# Facebook OAuth
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET

# Apple Sign-In
APPLE_CLIENT_ID=com.citywatcher.app

# JWT Configuration (existing)
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key
```

## Testing

### Test Google Sign-In
1. Run the app on a device or simulator
2. Tap "Sign in with Google"
3. Select a Google account
4. Verify successful authentication

### Test Facebook Login
1. Add test users in Facebook App Dashboard
2. Run the app
3. Tap "Sign in with Facebook"
4. Login with test user credentials

### Test Apple Sign-In (iOS only)
1. Run the app on iOS device or simulator
2. Tap "Sign in with Apple"
3. Use Apple ID credentials
4. Verify successful authentication

## Troubleshooting

### Google Sign-In Issues
- Verify SHA-1 fingerprint matches
- Check bundle ID / package name matches
- Ensure Google+ API is enabled

### Facebook Login Issues
- Verify key hash is correct
- Check app is in development mode
- Add test users if needed

### Apple Sign-In Issues
- Verify capability is enabled in Xcode
- Check bundle ID matches
- Ensure running on iOS 13+

## Security Notes

1. Never commit OAuth credentials to version control
2. Use environment variables for sensitive data
3. Rotate secrets regularly
4. Use different credentials for development and production
5. Monitor OAuth usage in respective consoles
