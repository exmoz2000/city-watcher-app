import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { startNetworkListener, stopNetworkListener } from './src/services/offlineQueue';

export default function App() {
  console.log('[App] Rendering App component');
  
  // Task 27.3: Start network listener for offline queue
  useEffect(() => {
    console.log('[App] Starting network listener');
    startNetworkListener();
    return () => {
      console.log('[App] Stopping network listener');
      stopNetworkListener();
    };
  }, []);

  console.log('[App] Returning JSX');
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
