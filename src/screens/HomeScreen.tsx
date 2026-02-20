import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { mockUser, mockAlerts, mockReports } from '../constants/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const activeReportsCount = mockReports.filter(
    (r) => r.userId === mockUser.id && r.status !== 'resolved' && r.status !== 'closed'
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.lg }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {mockUser.profile.firstName} 👋
          </Text>
          <Text style={styles.subGreeting}>What would you like to do?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color={Colors.textPrimary}
          />
          {mockAlerts.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {/* Action Cards */}
      <View style={styles.actionCards}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: Colors.reportCardBg }]}
          onPress={() => navigation.navigate('ReportCategory')}
        >
          <View style={styles.actionCardIcon}>
            <MaterialCommunityIcons
              name="camera"
              size={28}
              color={Colors.textWhite}
            />
          </View>
          <Text style={styles.actionCardTitle}>Report Issue</Text>
          <Text style={styles.actionCardDesc}>
            Photo + GPS{'\n'}auto-tagged
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: Colors.sosCardBg }]}
          onPress={() => navigation.navigate('EmergencySOS')}
        >
          <View style={styles.actionCardIcon}>
            <MaterialCommunityIcons
              name="phone-alert"
              size={28}
              color={Colors.textWhite}
            />
          </View>
          <Text style={styles.actionCardTitle}>Emergency SOS</Text>
          <Text style={styles.actionCardDesc}>
            Police, Ambulance{'\n'}or Fire
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: Colors.liveReportsCardBg },
          ]}
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'Reports' } as any)
          }
        >
          <View style={styles.actionCardIcon}>
            <MaterialCommunityIcons
              name="clipboard-pulse"
              size={28}
              color={Colors.textWhite}
            />
          </View>
          <Text style={styles.actionCardTitle}>Live Reports</Text>
          <Text style={styles.actionCardDesc}>
            {activeReportsCount} active{'\n'}reports
          </Text>
        </TouchableOpacity>
      </View>

      {/* City Insights Banner */}
      <TouchableOpacity
        style={styles.insightsBanner}
        onPress={() => navigation.navigate('Heatmap')}
      >
        <View style={styles.insightsBannerLeft}>
          <MaterialCommunityIcons name="map-search" size={24} color={Colors.textWhite} />
          <View style={{ marginLeft: Spacing.md }}>
            <Text style={styles.insightsBannerTitle}>City Insights</Text>
            <Text style={styles.insightsBannerDesc}>View issue heatmap & hotspots</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textWhite} />
      </TouchableOpacity>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', { screen: 'Alerts' } as any)
            }
          >
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {mockAlerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            style={styles.alertCard}
            onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
          >
            <View style={styles.alertHeader}>
              <View
                style={[
                  styles.severityBadge,
                  alert.severity === 'critical' && styles.severityCritical,
                  alert.severity === 'warning' && styles.severityWarning,
                  alert.severity === 'info' && styles.severityInfo,
                ]}
              >
                <Text style={styles.severityText}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.alertTime}>
                {formatTimeAgo(alert.createdAt)}
              </Text>
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage} numberOfLines={2}>
              {alert.message}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recent Reports</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', { screen: 'Reports' } as any)
            }
          >
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {mockReports
          .filter((r) => r.userId === mockUser.id)
          .slice(0, 3)
          .map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() =>
                navigation.navigate('ReportDetail', { reportId: report.id })
              }
            >
              <View style={styles.reportRow}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(report.category)}
                  size={24}
                  color={Colors.primaryOrange}
                />
                <View style={styles.reportInfo}>
                  <Text style={styles.reportCaseId}>{report.caseId}</Text>
                  <Text style={styles.reportDesc} numberOfLines={1}>
                    {report.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(report.status) },
                    ]}
                  >
                    {getStatusLabel(report.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

function getCategoryIcon(category: string): any {
  const icons: Record<string, string> = {
    pothole: 'car',
    water_leak: 'water',
    power_outage: 'flash',
    traffic_light: 'traffic-light',
    street_light: 'lightbulb-outline',
    garbage: 'delete',
    other: 'clipboard-text',
  };
  return icons[category] || 'clipboard-text';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    received: Colors.statusReceived,
    under_review: Colors.statusUnderReview,
    crew_dispatched: Colors.statusDispatched,
    in_progress: Colors.statusInProgress,
    resolved: Colors.statusCompleted,
    closed: Colors.textSecondary,
  };
  return colors[status] || Colors.textSecondary;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    received: 'Received',
    under_review: 'Reviewing',
    crew_dispatched: 'Dispatched',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status] || status;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  subGreeting: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emergencyRed,
  },
  actionCards: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  actionCard: {
    flex: 1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    minHeight: 140,
    ...Shadows.card,
  },
  actionCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionCardTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  actionCardDesc: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 14,
  },
  insightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    backgroundColor: '#5B4A9E',
    ...Shadows.card,
  },
  insightsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsBannerTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  insightsBannerDesc: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
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
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  seeAllLink: {
    fontSize: Fonts.sizes.sm,
    color: Colors.linkBlue,
    fontWeight: Fonts.weights.medium,
  },
  alertCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severityCritical: {
    backgroundColor: Colors.emergencyRedLight,
  },
  severityWarning: {
    backgroundColor: '#FFF3E0',
  },
  severityInfo: {
    backgroundColor: '#E3F2FD',
  },
  severityText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  alertTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  alertTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  alertMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reportCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  reportCaseId: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  reportDesc: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
  },
});
