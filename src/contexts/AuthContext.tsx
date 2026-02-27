import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
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

  // Auto-login on mount
  useEffect(() => {
    let cancelled = false;
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Starting initialization...');
        const storedToken = await SecureStore.getItemAsync('auth_token');
        console.log('[AuthContext] Stored token:', storedToken ? 'found' : 'not found');
        
        if (!storedToken) {
          if (!cancelled) {
            console.log('[AuthContext] No token, setting loading to false');
            setIsLoading(false);
          }
          return;
        }
        
        console.log('[AuthContext] Fetching profile...');
        const profile = await api.getProfile();
        console.log('[AuthContext] Profile fetched:', profile.email);
        
        if (!cancelled) {
          setToken(storedToken);
          setUser(profile);
        }
      } catch (error) {
        console.error('[AuthContext] Error during init:', error);
        try { await SecureStore.deleteItemAsync('auth_token'); } catch {}
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          console.log('[AuthContext] Setting loading to false');
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await api.register(data);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
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
