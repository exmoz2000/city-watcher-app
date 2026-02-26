import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { User } from '../types';
import * as api from '../services/api';
import { RegisterRequest } from '../services/api';

// --- Context Shape ---
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Provider ---
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);

  // Register push token with backend
  const registerPushToken = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      await api.registerDeviceToken(pushToken, Platform.OS);
      setDevicePushToken(pushToken);
    } catch {
      // Push registration is best-effort
    }
  }, []);

  // Auto-login on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        if (!storedToken) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const profile = await api.getProfile();
        if (!cancelled) {
          setToken(storedToken);
          setUser(profile);
          // Register push token after auto-login
          registerPushToken();
        }
      } catch {
        // Token invalid or expired — clear it
        try { await SecureStore.deleteItemAsync('auth_token'); } catch {}
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [registerPushToken]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    // Register push token after login
    registerPushToken();
  }, [registerPushToken]);

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await api.register(data);
    setToken(result.token);
    setUser(result.user);
    // Register push token after registration
    registerPushToken();
  }, [registerPushToken]);

  const logout = useCallback(async () => {
    // Deactivate push token if registered
    if (devicePushToken) {
      try { await api.removeDeviceToken(devicePushToken); } catch {}
      setDevicePushToken(null);
    }
    await api.logout();
    setUser(null);
    setToken(null);
  }, [devicePushToken]);

  // Expose setter for push token registration (used by Task 26.1)
  const value: AuthContextValue & { setDevicePushToken: (t: string | null) => void } = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    setDevicePushToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Hook ---
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
