import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  Report,
  CommunityAlert,
  User,
} from '../types';
import {
  mapBackendReportToMobile,
  mapMobileReportToBackend,
  mapBackendUserToMobile,
  mapBackendAlertToMobile,
  BackendReport,
  BackendUser,
  BackendAlert,
} from './mappers';

// --- Configuration ---
const BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'auth_token';

// --- Error Classes ---
export class NetworkError extends Error {
  readonly isNetworkError = true;
  constructor(message = 'No internet connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  readonly isAuthError = true;
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly serverMessage: string;
  constructor(status: number, serverMessage: string) {
    super(serverMessage);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// --- Request / Response Types ---
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  municipalityId?: number;
}

export interface CreateReportRequest {
  category: string;
  title: string;
  description: string;
  priority?: string;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  photoUri?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// --- Axios Instance ---
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Request Interceptor: attach Bearer token ---
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore unavailable — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response Error Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    if (!error.response) {
      throw new NetworkError();
    }
    const status = error.response.status;
    const serverMessage =
      error.response.data?.error ||
      error.response.data?.message ||
      error.message ||
      'Unknown error';

    if (status === 401) {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // ignore
      }
      throw new AuthError(serverMessage);
    }

    throw new ApiError(status, serverMessage);
  },
);

// --- Endpoint Functions ---

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', { email, password });
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  return {
    token: data.token,
    user: mapBackendUserToMobile(data.user),
  };
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', {
    email: req.email,
    password: req.password,
    first_name: req.firstName,
    last_name: req.lastName,
    phone: req.phone,
    municipality_id: req.municipalityId,
  });
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  return {
    token: data.token,
    user: mapBackendUserToMobile(data.user),
  };
}

export async function getReports(citizenEmail?: string): Promise<Report[]> {
  const params: Record<string, string> = {};
  if (citizenEmail) params.citizen_email = citizenEmail;
  const { data } = await apiClient.get('/reports', { params });
  const reports: BackendReport[] = Array.isArray(data) ? data : data.reports ?? [];
  return reports.map(mapBackendReportToMobile);
}

export async function getReportById(id: string | number): Promise<Report> {
  const { data } = await apiClient.get(`/reports/${id}`);
  const report: BackendReport = data.report ?? data;
  return mapBackendReportToMobile(report);
}

export async function createReport(req: CreateReportRequest): Promise<Report> {
  const payload = mapMobileReportToBackend(req);
  const { data } = await apiClient.post('/reports', payload);
  const report: BackendReport = data.report ?? data;
  return mapBackendReportToMobile(report);
}

export async function uploadPhoto(reportId: string | number, photoUri: string): Promise<void> {
  const formData = new FormData();
  const filename = photoUri.split('/').pop() || 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  formData.append('file', {
    uri: photoUri,
    name: filename,
    type: mimeType,
  } as any);
  await apiClient.post(`/mobile/reports/${reportId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function getAlerts(lat?: number, lng?: number): Promise<CommunityAlert[]> {
  const params: Record<string, number> = {};
  if (lat !== undefined) params.lat = lat;
  if (lng !== undefined) params.lng = lng;
  const { data } = await apiClient.get('/mobile/alerts', { params });
  const alerts: BackendAlert[] = Array.isArray(data) ? data : data.alerts ?? [];
  return alerts.map(mapBackendAlertToMobile);
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get('/auth/me');
  const user: BackendUser = data.user ?? data;
  return mapBackendUserToMobile(user);
}

export async function updateProfile(req: UpdateProfileRequest): Promise<User> {
  const payload: Record<string, any> = {};
  if (req.firstName !== undefined) payload.first_name = req.firstName;
  if (req.lastName !== undefined) payload.last_name = req.lastName;
  if (req.phone !== undefined) payload.phone = req.phone;
  const { data } = await apiClient.patch('/mobile/profile', payload);
  const user: BackendUser = data.user ?? data;
  return mapBackendUserToMobile(user);
}

export async function getNotifications(): Promise<any[]> {
  const { data } = await apiClient.get('/notifications');
  return Array.isArray(data) ? data : data.notifications ?? [];
}

export async function registerDeviceToken(token: string, platform: string): Promise<void> {
  await apiClient.post('/mobile/device-tokens', {
    expo_push_token: token,
    platform,
  });
}

export async function removeDeviceToken(token: string): Promise<void> {
  await apiClient.delete('/mobile/device-tokens', {
    data: { expo_push_token: token },
  });
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Best-effort — clear token regardless
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
