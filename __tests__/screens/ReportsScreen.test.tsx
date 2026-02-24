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

import ReportsScreen from '../../src/screens/ReportsScreen';
import { mockReports } from '../../src/constants/mockData';

const Stack = createNativeStackNavigator();

function renderReportsScreen() {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('ReportsScreen', () => {
  it('renders filter options (All, Active, Resolved)', () => {
    const { getByText } = renderReportsScreen();
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Resolved')).toBeTruthy();
  });

  it('renders report cards from mock data', () => {
    const { getByText } = renderReportsScreen();
    // Check that at least the first report description is rendered
    expect(getByText(mockReports[0].description)).toBeTruthy();
  });

  it('shows case IDs on report cards', () => {
    const { getByText } = renderReportsScreen();
    // Check the first report's case ID is visible
    expect(getByText(mockReports[0].caseId)).toBeTruthy();
  });
});
