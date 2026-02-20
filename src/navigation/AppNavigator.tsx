import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList, BottomTabParamList } from '../types';
import { Colors, Fonts } from '../constants/theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportCategoryScreen from '../screens/ReportCategoryScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import ReportSubmittedScreen from '../screens/ReportSubmittedScreen';
import EmergencySOSScreen from '../screens/EmergencySOSScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import HeatmapScreen from '../screens/HeatmapScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryOrange,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: Fonts.sizes.xs,
          fontWeight: Fonts.weights.medium,
        },
        tabBarStyle: {
          backgroundColor: Colors.backgroundWhite,
          borderTopColor: Colors.borderLight,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="ReportCategory"
          component={ReportCategoryScreen}
          options={{
            headerShown: true,
            title: 'Report an Issue',
            headerTintColor: Colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="ReportForm"
          component={ReportFormScreen}
          options={{
            headerShown: true,
            title: 'New Report',
            headerTintColor: Colors.textPrimary,
          }}
        />
        <Stack.Screen name="ReportSubmitted" component={ReportSubmittedScreen} />
        <Stack.Screen
          name="EmergencySOS"
          component={EmergencySOSScreen}
          options={{
            headerShown: true,
            title: 'Emergency SOS',
            headerTintColor: Colors.emergencyRed,
            headerStyle: { backgroundColor: Colors.emergencyRedLight },
          }}
        />
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{
            headerShown: true,
            title: 'Report Details',
            headerTintColor: Colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="AlertDetail"
          component={AlertDetailScreen}
          options={{
            headerShown: true,
            title: 'Alert Details',
            headerTintColor: Colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="Heatmap"
          component={HeatmapScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
