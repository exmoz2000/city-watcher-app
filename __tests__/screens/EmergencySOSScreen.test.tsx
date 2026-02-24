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

import EmergencySOSScreen from '../../src/screens/EmergencySOSScreen';

const Stack = createNativeStackNavigator();

function renderEmergencyScreen() {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="EmergencySOS"
          component={EmergencySOSScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('EmergencySOSScreen', () => {
  it('renders emergency service options (Police, Ambulance, Fire)', () => {
    const { getByText } = renderEmergencyScreen();
    expect(getByText('Police')).toBeTruthy();
    expect(getByText('Ambulance')).toBeTruthy();
    expect(getByText('Fire')).toBeTruthy();
  });

  it('shows SA emergency numbers (10111, 10177)', () => {
    const { getAllByText, getByText } = renderEmergencyScreen();
    expect(getByText('10111')).toBeTruthy();
    // 10177 appears for both Ambulance and Fire
    expect(getAllByText('10177').length).toBeGreaterThanOrEqual(1);
  });

  it('shows location warning text', () => {
    const { getByText } = renderEmergencyScreen();
    expect(
      getByText(/Only use in genuine emergencies/),
    ).toBeTruthy();
  });
});
