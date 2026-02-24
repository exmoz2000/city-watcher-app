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

import HomeScreen from '../../src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

function renderHomeScreen() {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('HomeScreen', () => {
  it('renders greeting with user name', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText(/Hello, John/)).toBeTruthy();
  });

  it('renders 3 action cards (Emergency SOS, Report, Live Reports)', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('Emergency SOS')).toBeTruthy();
    expect(getByText('Report Issue')).toBeTruthy();
    expect(getByText('Live Reports')).toBeTruthy();
  });

  it('renders recent reports section', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('Your Recent Reports')).toBeTruthy();
  });

  it('renders recent alerts section', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('Recent Alerts')).toBeTruthy();
  });
});
