# CityWatcher App Store Deployment Guide

Complete guide for building and submitting CityWatcher to Google Play Store and Apple App Store.

## Prerequisites

### Required Accounts
1. **Expo Account** (Free)
   - Sign up at https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

2. **Google Play Console** ($25 one-time fee)
   - Create account at https://play.google.com/console
   - Complete developer profile
   - Accept developer agreement

3. **Apple Developer Program** ($99/year)
   - Enroll at https://developer.apple.com/programs/
   - Complete enrollment (can take 24-48 hours)
   - Accept agreements in App Store Connect

### Required Tools
- Node.js 18+ installed
- EAS CLI: `npm install -g eas-cli`
- Git installed and configured

---

## Step 1: Prepare Your App Configuration

### 1.1 Update app.json

Update `app.json` with production settings:

```json
{
  "expo": {
    "name": "CityWatcher",
    "slug": "citywatcher",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#F5A623"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.citywatcher.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "CityWatcher needs your location to report issues accurately.",
        "NSCameraUsageDescription": "CityWatcher needs camera access to take photos of issues.",
        "NSPhotoLibraryUsageDescription": "CityWatcher needs photo library access to attach images to reports."
      }
    },
    "android": {
      "package": "com.citywatcher.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F5A623"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```

### 1.2 Update Backend URL

Before building, update the API URL in `src/services/api.ts`:

```typescript
// PRODUCTION: Use your deployed backend URL
const BASE_URL = 'https://your-production-backend.com/api';
```

**IMPORTANT:** Deploy your Flask backend to a production service first:
- Render.com (recommended, free tier available)
- Railway.app
- Heroku
- DigitalOcean App Platform

---

## Step 2: Initialize EAS Build

### 2.1 Configure EAS

Run in your project directory:

```bash
cd city-watcher-app
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2.2 Link Project to Expo

```bash
eas init
```

This will:
- Create an Expo project
- Generate a project ID
- Update your app.json with the project ID

---

## Step 3: Build for Android (Google Play Store)

### 3.1 Create Production Build

```bash
eas build --platform android --profile production
```

This will:
- Upload your code to Expo servers
- Build an AAB (Android App Bundle) file
- Take 10-20 minutes
- Provide a download link when complete

### 3.2 Download the AAB

After build completes:
- Download the `.aab` file from the provided link
- Or download from https://expo.dev/accounts/[your-account]/projects/citywatcher/builds

### 3.3 Prepare Store Listing

Create these assets:

**Screenshots** (Required):
- At least 2 screenshots
- Recommended: 4-8 screenshots
- Size: 1080x1920 or 1080x2340 (portrait)
- Show key features: report submission, map view, alerts

**App Icon:**
- 512x512 PNG
- Already have: `assets/icon.png`

**Feature Graphic:**
- 1024x500 PNG
- Create a banner showcasing the app

**Short Description:** (80 characters max)
```
Report municipal issues instantly. Track repairs. Stay informed.
```

**Full Description:**
```
CityWatcher empowers citizens to report municipal issues directly to their local government.

KEY FEATURES:
• Report Issues: Snap a photo, add location, submit instantly
• Track Progress: Monitor your reports from submission to resolution
• Community Alerts: Receive notifications about issues in your area
• Interactive Map: View all reported issues on a live map
• Multiple Categories: Potholes, water leaks, power outages, and more

HOW IT WORKS:
1. Take a photo of the issue
2. GPS automatically tags the location
3. Add a description
4. Submit to the relevant department
5. Track resolution progress

CityWatcher makes it easy to contribute to a better community. Download now and make a difference!
```

### 3.4 Submit to Google Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in app details:
   - App name: CityWatcher
   - Default language: English
   - App or game: App
   - Free or paid: Free
4. Complete all required sections:
   - **App access**: All functionality available without restrictions
   - **Ads**: Does not contain ads
   - **Content rating**: Complete questionnaire (likely PEGI 3/Everyone)
   - **Target audience**: 13+ recommended
   - **News app**: No
   - **COVID-19 contact tracing**: No
   - **Data safety**: Declare location, camera, photo permissions
5. Upload AAB file in "Production" > "Create new release"
6. Add release notes
7. Submit for review (takes 1-7 days)

---

## Step 4: Build for iOS (Apple App Store)

### 4.1 Create Production Build

```bash
eas build --platform ios --profile production
```

This will:
- Prompt for Apple ID credentials
- Generate signing certificates automatically
- Build an IPA file
- Take 15-30 minutes

**Note:** You need an active Apple Developer Program membership ($99/year)

### 4.2 Prepare App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" > "+" > "New App"
3. Fill in details:
   - Platform: iOS
   - Name: CityWatcher
   - Primary Language: English
   - Bundle ID: com.citywatcher.app (must match app.json)
   - SKU: citywatcher-001 (unique identifier)
   - User Access: Full Access

### 4.3 Prepare Store Listing

**Screenshots** (Required for each device):
- iPhone 6.7" (iPhone 14 Pro Max): 1290x2796
- iPhone 6.5" (iPhone 11 Pro Max): 1242x2688
- iPhone 5.5" (iPhone 8 Plus): 1242x2208
- iPad Pro 12.9": 2048x2732

**App Preview Video** (Optional but recommended):
- 15-30 seconds
- Show key features

**App Icon:**
- 1024x1024 PNG (no transparency)
- Already have: `assets/icon.png`

**Description:**
```
CityWatcher empowers citizens to report municipal issues directly to their local government.

FEATURES:
• Report Issues: Snap a photo, add location, submit instantly
• Track Progress: Monitor your reports from submission to resolution
• Community Alerts: Receive notifications about issues in your area
• Interactive Map: View all reported issues on a live map
• Multiple Categories: Potholes, water leaks, power outages, and more

Make a difference in your community. Download CityWatcher today!
```

**Keywords:** (100 characters max)
```
municipal,report,city,issues,government,civic,community,repair,maintenance,local
```

**Support URL:**
```
https://citywatcher.co.za/support
```

**Privacy Policy URL:** (Required)
```
https://citywatcher.co.za/privacy
```

### 4.4 Submit Build

1. In App Store Connect, go to your app
2. Click "+" next to "iOS App"
3. Select the build uploaded by EAS
4. Fill in all required information:
   - App Information
   - Pricing and Availability (Free)
   - App Privacy (declare location, camera, photos)
   - Age Rating (4+)
5. Submit for review (takes 1-3 days typically)

---

## Step 5: Create Privacy Policy

You MUST have a privacy policy. Here's a template:

```markdown
# CityWatcher Privacy Policy

Last updated: [DATE]

## Information We Collect

### Location Data
We collect your device's location when you submit a report to accurately tag the issue location.

### Photos
We collect photos you take within the app to document reported issues.

### Personal Information
- Email address (for account creation)
- Name (optional, for report attribution)
- Phone number (optional, for contact)

## How We Use Your Information

- Process and route your issue reports to the appropriate municipal department
- Send you notifications about your reports and community alerts
- Improve our service

## Data Sharing

We share your reports with the relevant municipal authorities. We do not sell your personal information.

## Data Security

We use industry-standard encryption to protect your data.

## Your Rights

You can request deletion of your account and data at any time by contacting support@citywatcher.co.za

## Contact Us

Email: support@citywatcher.co.za
Website: https://citywatcher.co.za
```

Host this at: `https://citywatcher.co.za/privacy`

---

## Step 6: Testing Before Submission

### 6.1 Internal Testing (Recommended)

**Android:**
```bash
eas build --platform android --profile preview
```
- Generates APK for testing
- Share with testers via link
- Test all features thoroughly

**iOS:**
```bash
eas build --platform ios --profile preview
```
- Generates IPA for TestFlight
- Add testers in App Store Connect
- Distribute via TestFlight

### 6.2 Test Checklist

- [ ] Login/Signup works
- [ ] Camera captures photos
- [ ] GPS location is accurate
- [ ] Reports submit successfully
- [ ] Map displays correctly
- [ ] Alerts load and display
- [ ] Profile updates work
- [ ] Offline queue functions
- [ ] Push notifications work (if enabled)
- [ ] App doesn't crash on any screen

---

## Step 7: Post-Submission

### App Review Timeline

**Google Play:**
- Initial review: 1-7 days
- Updates: 1-3 days
- Can expedite for critical fixes

**Apple App Store:**
- Initial review: 1-3 days
- Updates: 1-2 days
- Can request expedited review for critical issues

### Common Rejection Reasons

**Both Stores:**
- Broken functionality
- Crashes on launch
- Missing privacy policy
- Incomplete metadata
- Poor quality screenshots

**Apple Specific:**
- Guideline violations
- Incomplete app information
- Missing required device support

### After Approval

1. **Monitor Crashes:**
   - Use Expo's built-in crash reporting
   - Check https://expo.dev/accounts/[your-account]/projects/citywatcher/insights

2. **Respond to Reviews:**
   - Reply to user feedback
   - Address issues in updates

3. **Release Updates:**
   ```bash
   # Increment version in app.json
   # Build new version
   eas build --platform all --profile production
   
   # Submit update
   eas submit --platform all --profile production
   ```

---

## Step 8: Continuous Deployment (Optional)

### Automate Builds with GitHub Actions

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches:
      - main
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g eas-cli
      - run: npm ci
      - run: eas build --platform all --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Costs Summary

### One-Time Costs
- Google Play Console: $25
- Apple Developer Program: $99/year

### Ongoing Costs
- Apple Developer: $99/year (renewal)
- Backend hosting: $0-25/month (Render free tier or paid)
- Expo: Free (paid plans available for teams)

### Total First Year
- Android only: $25
- iOS only: $99
- Both platforms: $124

---

## Quick Command Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project
eas init

# Configure builds
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Build for both
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# View project on Expo
eas open
```

---

## Troubleshooting

### Build Fails

**Check logs:**
```bash
eas build:list
# Click on failed build to view logs
```

**Common issues:**
- Missing dependencies: Run `npm install`
- Invalid app.json: Validate JSON syntax
- Certificate issues (iOS): Run `eas credentials`

### Submission Fails

**Android:**
- Ensure AAB is signed correctly
- Check package name matches console
- Verify all required fields completed

**iOS:**
- Ensure bundle ID matches App Store Connect
- Check all required screenshots uploaded
- Verify privacy policy URL is accessible

---

## Next Steps After Launch

1. **Marketing:**
   - Create landing page
   - Social media presence
   - Press release to local media
   - Contact municipalities directly

2. **Analytics:**
   - Integrate Google Analytics or Mixpanel
   - Track user engagement
   - Monitor feature usage

3. **Feedback Loop:**
   - In-app feedback form
   - Monitor store reviews
   - Regular user surveys

4. **Iterate:**
   - Release updates based on feedback
   - Add requested features
   - Fix bugs promptly

---

## Support Resources

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **App Store Connect Help:** https://developer.apple.com/support/app-store-connect/
- **Expo Discord:** https://chat.expo.dev

---

## Contact

For questions about this deployment process:
- Email: dev@citywatcher.co.za
- GitHub Issues: https://github.com/exmoz2000/city-watcher-app/issues

Good luck with your app launch! 🚀
