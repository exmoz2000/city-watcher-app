import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../types';
import { mockReports, mockAlerts, mockUser } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import ReportCard from '../components/ReportCard';
import AlertCard from '../components/AlertCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const recentReports = mockReports.filter((r) => r.userId === mockUser.id).slice(0, 3);
  const activeAlerts = mockAlerts.filter((a) => a.isActive).slice(0, 2);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{mockUser.profile.firstName}!</Text>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color={Colors.textPrimary}
          />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Action Cards */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: Colors.sosCardBg }]}
          onPress={() => navigation.navigate('EmergencySOS')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="alarm-light" size={32} color="#fff" />
          <Text style={styles.actionTitle}>Emergency{'\n'}SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: Colors.reportCardBg }]}
          onPress={() => navigation.navigate('ReportCategory')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="camera-plus" size={32} color="#fff" />
          <Text style={styles.actionTitle}>Report{'\n'}Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: Colors.liveReportsCardBg }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Reports' } as any)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="clipboard-list" size={32} color="#fff" />
          <Text style={styles.actionTitle}>Live{'\n'}Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recent Reports</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Reports' } as any)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentReports.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={48}
              color={Colors.textLight}
            />
            <Text style={styles.emptyText}>No reports yet</Text>
          </View>
        ) : (
          recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={(r) => navigation.navigate('ReportDetail', { reportId: r.id })}
            />
          ))
        )}
      </View>

      {/* Active Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Alerts' } as any)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {activeAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onPress={(a) => navigation.navigate('AlertDetail', { alertId: a.id })}
          />
        ))}
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  container: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emergencyRed,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  actionCard: {
    flex: 1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...Shadows.cardLarge,
  },
  actionTitle: {
    color: Colors.textWhite,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: Fonts.sizes.sm,
    color: Colors.linkBlue,
    fontWeight: Fonts.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
});
