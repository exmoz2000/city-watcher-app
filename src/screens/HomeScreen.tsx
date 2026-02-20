import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { mockReports, mockAlerts, mockUser } from '../constants/mockData';
import ActionCard from '../components/ActionCard';
import ReportCard from '../components/ReportCard';
import AlertCard from '../components/AlertCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const recentReports = mockReports.filter((r) => r.userId === mockUser.id).slice(0, 2);
  const activeAlerts = mockAlerts.filter((a) => a.isActive).slice(0, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          Hello, {mockUser.profile.firstName} 👋
        </Text>
        <Text style={styles.greetingSubtext}>How can we help today?</Text>
      </View>

      <View style={styles.actionRow}>
        <ActionCard
          title="Emergency SOS"
          subtitle="Get help now"
          icon="phone-alert"
          backgroundColor={Colors.sosCardBg}
          onPress={() => navigation.navigate('EmergencySOS')}
        />
        <ActionCard
          title="Report Issue"
          subtitle="Snap & submit"
          icon="camera-plus"
          backgroundColor={Colors.reportCardBg}
          onPress={() => navigation.navigate('ReportCategory')}
        />
        <ActionCard
          title="My Reports"
          subtitle="Track status"
          icon="clipboard-list"
          backgroundColor={Colors.liveReportsCardBg}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Reports' } as any)}
        />
      </View>

      {activeAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {activeAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        {recentReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    paddingBottom: Spacing.section,
  },
  greeting: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  greetingSubtext: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
