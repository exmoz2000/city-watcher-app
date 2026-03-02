import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as api from './api';

const PUSH_TOKEN_KEY = 'expo_push_token';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  reportId?: string;
  type?: 'status_change' | 'assignment';
  oldStatus?: string;
  newStatus?: string;
}

class NotificationManager {
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private onNotificationReceived: ((notification: Notifications.Notification) => void) | null = null;
  private onNotificationTapped: ((data: NotificationData) => void) | null = null;

  /**
   * Initialize notification listeners and handlers
   */
  async initialize(
    onReceived?: (notification: Notifications.Notification) => void,
    onTapped?: (data: NotificationData) => void
  ): Promise<void> {
    this.onNotificationReceived = onReceived || null;
    this.onNotificationTapped = onTapped || null;

    // Set up listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Set up listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );

    // Check for notification that launched the app
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      this.handleNotificationResponse(response);
    }
  }

  /**
   * Request permissions and register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Only works on physical devices
    if (!Device.isDevice) {
      console.log('[NotificationManager] Push notifications only work on physical devices');
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationManager] Permission denied');
        return null;
      }

      // Get Expo push token
      // For Expo Go, don't pass projectId - it will use the app's experienceId automatically
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      console.log('[NotificationManager] Push token obtained:', token);
      this.pushToken = token;

      // Register with backend
      await this.updatePushToken(token);

      return token;
    } catch (error) {
      console.error('[NotificationManager] Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Register or update push token with backend
   */
  async updatePushToken(token: string, retries = 3): Promise<boolean> {
    const platform = Platform.OS;
    const deviceName = Device.deviceName || `${Platform.OS} Device`;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await api.registerDeviceToken(token, platform);
        
        // Store token locally
        await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
        
        console.log('[NotificationManager] Token registered successfully');
        return true;
      } catch (error) {
        console.error(`[NotificationManager] Token registration attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('[NotificationManager] Failed to register token after all retries');
    return false;
  }

  /**
   * Remove push token on logout
   */
  async removePushToken(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
      if (token) {
        await api.removeDeviceToken(token);
        await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
        console.log('[NotificationManager] Token removed successfully');
      }
    } catch (error) {
      console.error('[NotificationManager] Error removing token:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('[NotificationManager] Notification received:', notification);
    
    if (this.onNotificationReceived) {
      this.onNotificationReceived(notification);
    }
  }

  /**
   * Handle notification tapped by user
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    console.log('[NotificationManager] Notification tapped:', response);
    
    const data = response.notification.request.content.data as NotificationData;
    
    if (this.onNotificationTapped && data) {
      this.onNotificationTapped(data);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Get stored push token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export default new NotificationManager();
