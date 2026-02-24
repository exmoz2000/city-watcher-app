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

import ReportDetailScreen from '../../src/screens/ReportDetailScreen';
import { mockReports } from '../../src/constants/mockData';

const Stack = createNativeStackNavigator();

function renderReportDetailScreen(reportId: string) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          initialParams={{ reportId }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('ReportDetailScreen', () => {
  const report = mockReports[0];

  it('renders status timeline', () => {
    const { getByText } = renderReportDetailScreen(report.id);
    expect(getByText('Status Timeline')).toBeTruthy();
  });

  it('shows case ID', () => {
    const { getByText } = renderReportDetailScreen(report.id);
    expect(getByText(report.caseId)).toBeTruthy();
  });

  it('shows AI classification info', () => {
    const { getByText } = renderReportDetailScreen(report.id);
    expect(getByText('AI Classification')).toBeTruthy();
    expect(getByText('Detected Category')).toBeTruthy();
    expect(getByText(/confidence/)).toBeTruthy();
  });
});
