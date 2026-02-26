import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { startNetworkListener, stopNetworkListener } from './src/services/offlineQueue';

export default function App() {
  // Task 27.3: Start network listener for offline queue
  useEffect(() => {
    startNetworkListener();
    return () => {
      stopNetworkListener();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
