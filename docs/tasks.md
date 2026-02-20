# Implementation Plan: City Watcher

## Overview

This implementation plan breaks down the City Watcher application into discrete, manageable coding tasks. The approach follows an incremental development strategy, building core infrastructure first, then layering on features, and finally integrating everything together. Each task builds on previous work, ensuring no orphaned code.

The implementation uses React Native for the mobile app, Node.js/Express for the backend, PostgreSQL with PostGIS for data storage, and fast-check for property-based testing.

## Tasks

- [-] 1. Set up project structure and development environment
  - Initialize React Native project with TypeScript
  - Set up Node.js/Express backend with TypeScript
  - Configure PostgreSQL database with PostGIS extension
  - Set up testing frameworks (Jest, React Native Testing Library, fast-check)
  - Configure ESLint, Prettier, and Git hooks
  - Create environment configuration files (.env templates)
  - _Requirements: All (foundational)_

- [ ] 2. Implement core data models and database schema
  - [ ] 2.1 Create database schema with PostGIS support
    - Define Users table with authentication fields
    - Define Reports table with geometry column for location
    - Define Emergency_Requests table with location tracking
    - Define Alerts table with geofence geometry
    - Create spatial indexes for location queries
    - _Requirements: 1.1, 2.2, 3.1, 4.1, 5.1, 6.2_

  - [ ] 2.2 Write property test for unique report identifiers
    - **Property 3: Unique Report Identifiers**
    - **Validates: Requirements 1.3**

  - [ ] 2.3 Create TypeScript interfaces and types
    - Define all data model interfaces (User, Report, EmergencyRequest, Alert)
    - Define enums (ReportCategory, ReportStatus, EmergencyServiceType, etc.)
    - Create type guards and validation utilities
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_



- [ ] 3. Implement authentication and user management
  - [ ] 3.1 Create user registration endpoint
    - Implement email and phone validation
    - Hash passwords using bcrypt
    - Generate JWT tokens
    - _Requirements: 5.1, 6.2_

  - [ ] 3.2 Write property test for registration validation
    - **Property 12: Registration Validation**
    - **Validates: Requirements 5.1**

  - [ ] 3.3 Write property test for password hashing
    - **Property 15: Password Hashing**
    - **Validates: Requirements 6.2**

  - [ ] 3.4 Create login endpoint with JWT authentication
    - Verify credentials against hashed passwords
    - Generate and return JWT tokens
    - Implement token refresh mechanism
    - _Requirements: 5.2, 5.3_

  - [ ] 3.5 Implement password reset flow
    - Generate unique reset tokens
    - Send reset email
    - Validate tokens and update passwords
    - _Requirements: 5.5_

  - [ ] 3.6 Write property test for password reset functionality
    - **Property 14: Password Reset Functionality**
    - **Validates: Requirements 5.5**

  - [ ] 3.7 Create profile management endpoints
    - Update user profile (emergency contacts, preferences)
    - Persist changes to database
    - _Requirements: 5.4_

  - [ ] 3.8 Write property test for profile update persistence
    - **Property 13: Profile Update Persistence**
    - **Validates: Requirements 5.4**

  - [ ] 3.9 Implement account deletion with PII removal
    - Delete user account
    - Remove all PII while preserving anonymized report data
    - _Requirements: 6.5_

  - [ ] 3.10 Write property test for account deletion and PII removal
    - **Property 16: Account Deletion and PII Removal**
    - **Validates: Requirements 6.5**

- [ ] 4. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [ ] 5. Implement location services and GPS handling
  - [ ] 5.1 Create location service module for React Native
    - Request location permissions (iOS and Android)
    - Get current GPS coordinates with accuracy
    - Handle location unavailable scenarios
    - _Requirements: 1.1, 2.2_

  - [ ] 5.2 Write property test for GPS coordinate tagging
    - **Property 1: GPS Coordinate Tagging**
    - **Validates: Requirements 1.1**

  - [ ] 5.3 Implement geofencing utilities
    - Point-in-circle calculation
    - Point-in-polygon calculation using Turf.js
    - Distance calculation between coordinates
    - _Requirements: 4.1, 4.2_

  - [ ] 5.4 Write property test for geofenced alert delivery
    - **Property 10: Geofenced Alert Delivery**
    - **Validates: Requirements 4.2, 4.4**

- [ ] 6. Implement photo capture and image handling
  - [ ] 6.1 Create camera module for React Native
    - Integrate React Native Camera
    - Capture photos with metadata
    - Attach GPS coordinates to photo metadata
    - Handle camera permissions
    - _Requirements: 1.1_

  - [ ] 6.2 Implement image upload to S3
    - Generate pre-signed S3 URLs
    - Upload images with progress tracking
    - Create thumbnails
    - _Requirements: 1.1_

  - [ ] 6.3 Write unit tests for camera integration
    - Test photo capture flow
    - Test permission handling
    - Test metadata attachment

- [ ] 7. Implement AI image classification service
  - [ ] 7.1 Create image classification API endpoint
    - Integrate with AWS Rekognition or custom CNN model
    - Preprocess images for model input
    - Return category with confidence score
    - Handle classification failures with fallback to "OTHER"
    - _Requirements: 1.2_

  - [ ] 7.2 Write property test for AI classification validity
    - **Property 2: AI Classification Validity**
    - **Validates: Requirements 1.2**

  - [ ] 7.3 Write unit tests for classification edge cases
    - Test low confidence scenarios
    - Test unsupported image formats
    - Test model inference failures



- [ ] 8. Implement infrastructure report submission
  - [ ] 8.1 Create report submission UI in React Native
    - Camera capture screen
    - Report form with description input
    - Category selection (with AI suggestion)
    - Location display on map
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 8.2 Create report submission API endpoint
    - Validate report data
    - Store report in database with PostGIS location
    - Trigger AI classification
    - Generate unique tracking ID
    - Return report confirmation
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 8.3 Implement offline report queue
    - Store reports locally when offline
    - Auto-submit when connectivity restored
    - Display offline indicator
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 8.4 Write property test for offline report queue processing
    - **Property 20: Offline Report Queue Processing**
    - **Validates: Requirements 8.2**

  - [ ] 8.5 Write property test for offline mode indication
    - **Property 21: Offline Mode Indication**
    - **Validates: Requirements 8.3**

- [ ] 9. Checkpoint - Ensure report submission tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement real-time notification system
  - [ ] 10.1 Set up WebSocket server with Socket.io
    - Create WebSocket connection handler
    - Implement subscription management
    - Handle connection lifecycle (connect, disconnect, reconnect)
    - _Requirements: 3.1, 7.3_

  - [ ] 10.2 Integrate push notifications
    - Set up Firebase Cloud Messaging (FCM) for Android
    - Set up Apple Push Notification Service (APNs) for iOS
    - Create notification payload builder
    - Handle notification permissions
    - _Requirements: 3.1, 4.2_

  - [ ] 10.3 Create WebSocket client in React Native
    - Establish WebSocket connection on app launch
    - Subscribe to user-specific topics
    - Handle incoming notifications
    - Reconnect on connection loss
    - _Requirements: 3.1, 7.3_

  - [ ] 10.4 Write property test for status update round-trip
    - **Property 6: Status Update Round-Trip**
    - **Validates: Requirements 3.1, 7.3**



- [ ] 11. Implement report status tracking (Live Loop)
  - [ ] 11.1 Create report list UI in React Native
    - Display user's active reports
    - Display historical reports
    - Show current status for each report
    - Pull-to-refresh functionality
    - _Requirements: 3.3, 3.4_

  - [ ] 11.2 Create report detail UI with status timeline
    - Display full report details
    - Show status history with timestamps
    - Display status progression visually
    - _Requirements: 3.2, 3.3_

  - [ ] 11.3 Write property test for report history completeness
    - **Property 7: Report History Completeness**
    - **Validates: Requirements 3.3**

  - [ ] 11.4 Create status update API endpoint
    - Update report status
    - Record status change in history
    - Trigger WebSocket notification to user
    - Trigger push notification
    - _Requirements: 3.1, 7.3_

  - [ ] 11.5 Implement feedback request on resolution
    - Detect status change to "Resolved"
    - Send feedback request notification
    - Create feedback submission UI
    - Store feedback in database
    - _Requirements: 3.5_

  - [ ] 11.6 Write property test for resolution feedback request
    - **Property 8: Resolution Feedback Request**
    - **Validates: Requirements 3.5**

- [ ] 12. Implement emergency SOS functionality
  - [ ] 12.1 Create emergency SOS UI in React Native
    - Large, accessible buttons for Police, Ambulance, Fire
    - Prominent display of current location
    - Warning when GPS unavailable
    - Emergency session status indicator
    - _Requirements: 2.1, 2.5_

  - [ ] 12.2 Create emergency request API endpoint
    - Validate emergency request
    - Store emergency request with location
    - Integrate with municipal dispatch API
    - Establish emergency session
    - _Requirements: 2.2, 2.3_

  - [ ] 12.3 Write property test for emergency GPS transmission
    - **Property 4: Emergency GPS Transmission**
    - **Validates: Requirements 2.2**

  - [ ] 12.4 Write property test for emergency connection establishment
    - **Property 5: Emergency Connection Establishment**
    - **Validates: Requirements 2.3, 2.4**

  - [ ] 12.5 Write unit tests for emergency edge cases
    - Test GPS unavailable scenario
    - Test dispatch API failure with fallback
    - Test connection timeout handling

- [ ] 13. Checkpoint - Ensure emergency and status tracking tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [ ] 14. Implement community alert system
  - [ ] 14.1 Create alert creation API endpoint (admin only)
    - Validate alert data and geofence
    - Store alert in database with PostGIS geometry
    - Calculate affected users within geofence
    - _Requirements: 4.1_

  - [ ] 14.2 Write property test for alert geofence specification
    - **Property 9: Alert Geofence Specification**
    - **Validates: Requirements 4.1**

  - [ ] 14.3 Implement alert delivery service
    - Query users within geofence boundary
    - Send push notifications to affected users
    - Send WebSocket notifications
    - Track delivery status
    - _Requirements: 4.2_

  - [ ] 14.4 Create alert display UI in React Native
    - Show incoming alerts prominently
    - Display affected location on map
    - Show recommended actions
    - Alert history list
    - _Requirements: 4.4, 4.5_

  - [ ] 14.5 Write property test for alert history persistence
    - **Property 11: Alert History Persistence**
    - **Validates: Requirements 4.5**

  - [ ] 14.6 Write unit tests for geofencing calculations
    - Test point-in-circle calculations
    - Test point-in-polygon calculations
    - Test edge cases (boundary points)

- [ ] 15. Implement offline data caching
  - [ ] 15.1 Create offline storage module
    - Cache viewed reports using AsyncStorage
    - Cache received alerts
    - Implement cache expiration logic
    - _Requirements: 8.5_

  - [ ] 15.2 Write property test for offline data caching
    - **Property 22: Offline Data Caching**
    - **Validates: Requirements 8.5**

  - [ ] 15.3 Write unit tests for cache management
    - Test cache storage and retrieval
    - Test cache expiration
    - Test cache size limits



- [ ] 16. Implement municipal dashboard (React web app)
  - [ ] 16.1 Create dashboard layout and navigation
    - Set up React app with Material-UI
    - Create navigation menu
    - Implement authentication flow
    - _Requirements: 7.1_

  - [ ] 16.2 Create report management interface
    - Interactive map view with report markers
    - List view with sorting and pagination
    - Report detail modal
    - Status update controls
    - _Requirements: 7.1, 7.2_

  - [ ] 16.3 Write property test for real-time report display
    - **Property 17: Real-Time Report Display**
    - **Validates: Requirements 7.1**

  - [ ] 16.4 Implement report filtering
    - Filter by category, status, priority
    - Filter by geographic area (map bounds)
    - Filter by date range
    - _Requirements: 7.2_

  - [ ] 16.5 Write property test for report filtering accuracy
    - **Property 18: Report Filtering Accuracy**
    - **Validates: Requirements 7.2**

  - [ ] 16.6 Create alert management interface
    - Map-based geofence drawing tool
    - Alert creation form
    - Alert template library
    - Active alerts list with expiration
    - _Requirements: 4.1_

  - [ ] 16.7 Implement role-based access control
    - Check user role on all protected endpoints
    - Restrict dashboard features by role
    - Display appropriate UI based on permissions
    - _Requirements: 7.5_

  - [ ] 16.8 Write property test for role-based access control
    - **Property 19: Role-Based Access Control**
    - **Validates: Requirements 7.5**

  - [ ] 16.9 Create analytics dashboard
    - Display average response times
    - Show report volumes by category
    - Calculate resolution rates
    - Visualize data with Chart.js
    - _Requirements: 7.4_

- [ ] 17. Checkpoint - Ensure dashboard tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [ ] 18. Implement multi-language support
  - [ ] 18.1 Set up i18n in React Native
    - Integrate react-i18next
    - Create translation files (English, Spanish)
    - Implement language selection UI
    - _Requirements: 10.1, 10.2_

  - [ ] 18.2 Implement language preference persistence
    - Store language preference in AsyncStorage
    - Load preference on app launch
    - Apply to all UI elements
    - _Requirements: 10.2, 10.5_

  - [ ] 18.3 Write property test for language selection and UI update
    - **Property 23: Language Selection and UI Update**
    - **Validates: Requirements 10.2, 10.5**

  - [ ] 18.4 Implement multi-language report submission
    - Accept report descriptions in any language
    - Store without modification
    - _Requirements: 10.3_

  - [ ] 18.5 Write property test for multi-language report submission
    - **Property 24: Multi-Language Report Submission**
    - **Validates: Requirements 10.3**

  - [ ] 18.6 Add translation assistance in dashboard
    - Integrate translation API (Google Translate or AWS Translate)
    - Display translation option for non-English reports
    - Show original and translated text
    - _Requirements: 10.4_

  - [ ] 18.7 Write property test for translation assistance
    - **Property 25: Translation Assistance for Dispatchers**
    - **Validates: Requirements 10.4**

- [ ] 19. Implement error handling and logging
  - [ ] 19.1 Create error handling middleware
    - Standardize error response format
    - Log errors with context
    - Handle different error types appropriately
    - _Requirements: All (cross-cutting)_

  - [ ] 19.2 Implement retry logic with exponential backoff
    - Retry failed API calls
    - Handle network timeouts
    - Queue operations for offline processing
    - _Requirements: 8.2_

  - [ ] 19.3 Add error boundaries in React Native
    - Catch and display UI errors gracefully
    - Log errors for debugging
    - Provide recovery options
    - _Requirements: All (cross-cutting)_

  - [ ] 19.4 Write unit tests for error handling
    - Test network error scenarios
    - Test validation error responses
    - Test authentication error handling
    - Test emergency service failure fallback



- [ ] 20. Implement monitoring and observability
  - [ ] 20.1 Set up application logging
    - Structured JSON logging
    - Request ID tracking
    - Performance metrics
    - _Requirements: All (cross-cutting)_

  - [ ] 20.2 Add production monitoring
    - Track error rates by error code
    - Monitor API response times
    - Track WebSocket connection stability
    - Monitor emergency request success rate (critical)
    - _Requirements: All (cross-cutting)_

  - [ ] 20.3 Configure alerting thresholds
    - Critical alert for emergency failures >1%
    - Warning alert for API errors >5%
    - Warning alert for WebSocket disconnections >10%
    - _Requirements: 2.2, 2.3_

- [ ] 21. Integration and end-to-end testing
  - [ ] 21.1 Write integration test for report submission flow
    - Test complete flow from photo capture to database storage
    - Verify AI classification integration
    - Verify notification delivery

  - [ ] 21.2 Write integration test for emergency request flow
    - Test complete emergency flow
    - Verify location transmission
    - Verify dispatch API integration

  - [ ] 21.3 Write integration test for alert delivery flow
    - Test alert creation and geofencing
    - Verify push notification delivery
    - Verify alert display in app

  - [ ] 21.4 Write integration test for offline-to-online sync
    - Test offline report queue
    - Verify auto-submission on reconnect
    - Verify data consistency

- [ ] 22. Final polish and optimization
  - [ ] 22.1 Optimize mobile app performance
    - Implement image compression
    - Optimize map rendering
    - Reduce bundle size
    - _Requirements: All (cross-cutting)_

  - [ ] 22.2 Implement accessibility features
    - Add screen reader support
    - Ensure color contrast compliance
    - Add voice-to-text for report descriptions
    - Test with accessibility tools
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 22.3 Security hardening
    - Implement rate limiting
    - Add input sanitization
    - Configure CORS properly
    - Review and fix security vulnerabilities
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ] 22.4 Write security tests
    - Test authentication bypass attempts
    - Test SQL injection prevention
    - Test XSS prevention
    - Test rate limiting

- [ ] 23. Final checkpoint - Complete system verification
  - Run all tests (unit, property, integration)
  - Verify all 25 correctness properties pass
  - Test on both iOS and Android devices
  - Verify dashboard functionality
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (25 total)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- React Native enables write-once, run-everywhere for iOS and Android
