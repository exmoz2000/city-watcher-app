import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    SafeAreaView: ({ children }: any) => children,
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

import AppNavigator from '../src/navigation/AppNavigator';
import SplashScreen from '../src/screens/SplashScreen';
import LoginScreen from '../src/screens/LoginScreen';
import SignUpScreen from '../src/screens/SignUpScreen';

const Stack = createNativeStackNavigator();

function renderWithNavigation(Component: React.ComponentType<any>, params?: any) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Test"
          component={Component}
          initialParams={params}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('AppNavigator', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<AppNavigator />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('SplashScreen', () => {
  it('renders the title "City Watcher"', () => {
    const { getByText } = renderWithNavigation(SplashScreen);
    expect(getByText('City Watcher')).toBeTruthy();
  });
});

describe('LoginScreen', () => {
  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = renderWithNavigation(LoginScreen);
    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
});

describe('SignUpScreen', () => {
  it('renders first name, last name, and phone inputs', () => {
    const { getByPlaceholderText } = renderWithNavigation(SignUpScreen);
    expect(getByPlaceholderText('First name')).toBeTruthy();
    expect(getByPlaceholderText('Last name')).toBeTruthy();
    expect(getByPlaceholderText('Phone number')).toBeTruthy();
  });
});
