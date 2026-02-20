import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts } from '../constants/theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ReportCategoryScreen from '../screens/ReportCategoryScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import ReportSubmittedScreen from '../screens/ReportSubmittedScreen';
import EmergencySOSScreen from '../screens/EmergencySOSScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.backgroundWhite,
        },
        headerTitleStyle: {
          fontWeight: Fonts.weights.bold,
          fontSize: Fonts.sizes.xl,
          color: Colors.textPrimary,
        },
        headerTintColor: Colors.primaryOrange,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerTitle: 'Create Account' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReportCategory"
        component={ReportCategoryScreen}
        options={{ headerTitle: 'Report an Issue' }}
      />
      <Stack.Screen
        name="ReportForm"
        component={ReportFormScreen}
        options={{ headerTitle: 'New Report' }}
      />
      <Stack.Screen
        name="ReportSubmitted"
        component={ReportSubmittedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmergencySOS"
        component={EmergencySOSScreen}
        options={{
          headerTitle: 'Emergency SOS',
          headerStyle: { backgroundColor: Colors.backgroundWhite },
        }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ headerTitle: 'Report Details' }}
      />
      <Stack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ headerTitle: 'Alert Details' }}
      />
    </Stack.Navigator>
  );
}
