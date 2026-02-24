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

import AlertDetailScreen from '../../src/screens/AlertDetailScreen';
import { mockAlerts } from '../../src/constants/mockData';

const Stack = createNativeStackNavigator();

function renderAlertDetailScreen(alertId: string) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="AlertDetail"
          component={AlertDetailScreen}
          initialParams={{ alertId }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('AlertDetailScreen', () => {
  const alert = mockAlerts[0];

  it('renders alert title', () => {
    const { getByText } = renderAlertDetailScreen(alert.id);
    expect(getByText(alert.title)).toBeTruthy();
  });

  it('shows affected radius and resident count', () => {
    const { getByText } = renderAlertDetailScreen(alert.id);
    expect(getByText(`${alert.affectedRadius}m`)).toBeTruthy();
    expect(getByText(String(alert.recipientCount))).toBeTruthy();
  });

  it('renders "Yes, I\'m affected" button', () => {
    const { getByText } = renderAlertDetailScreen(alert.id);
    expect(getByText("Yes, I'm affected")).toBeTruthy();
  });
});
