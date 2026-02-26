import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import * as api from './api';
import { NetworkError, ApiError } from './api';

// --- Types ---
export interface QueuedReport {
  id: string;
  payload: {
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
  };
  photoUri?: string;
  status: 'pending' | 'failed';
  createdAt: string;
  errorMessage?: string;
}

const STORAGE_KEY = '@citywatcher/offline_queue';

// --- Queue Operations ---

export async function enqueueReport(report: QueuedReport): Promise<void> {
  const queue = await getQueuedReports();
  queue.push(report);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function getQueuedReports(): Promise<QueuedReport[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedReport[];
  } catch {
    return [];
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueuedReports();
  const filtered = queue.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function markFailed(id: string, error: string): Promise<void> {
  const queue = await getQueuedReports();
  const updated = queue.map((r) =>
    r.id === id ? { ...r, status: 'failed' as const, errorMessage: error } : r,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getQueueCount(): Promise<number> {
  const queue = await getQueuedReports();
  return queue.filter((r) => r.status === 'pending').length;
}

export async function processQueue(): Promise<void> {
  const queue = await getQueuedReports();

  for (const item of queue) {
    if (item.status !== 'pending') continue;

    try {
      const report = await api.createReport(item.payload);

      // Upload photo if present
      if (item.photoUri) {
        await api.uploadPhoto(report.id, item.photoUri);
      }

      await removeFromQueue(item.id);
    } catch (err) {
      if (err instanceof NetworkError) {
        // No connectivity — stop processing, retry later
        return;
      }
      if (err instanceof ApiError && err.status >= 500) {
        // Server error — leave in queue as pending for retry
        continue;
      }
      // Client error (4xx) — mark as failed
      const message = err instanceof ApiError ? err.serverMessage : 'Submission failed';
      await markFailed(item.id, message);
    }
  }
}

// --- Network Listener ---

let subscription: NetInfoSubscription | null = null;
let wasConnected = true;

export function startNetworkListener(): void {
  subscription = NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected ?? false;

    // Trigger queue processing when connectivity is restored
    if (isConnected && !wasConnected) {
      processQueue().catch(() => {});
    }

    wasConnected = isConnected;
  });
}

export function stopNetworkListener(): void {
  if (subscription) {
    subscription();
    subscription = null;
  }
}
